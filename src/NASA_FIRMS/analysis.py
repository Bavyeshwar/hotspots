
import pandas as pd
import json

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# 1. Load data
viirs_1 = pd.read_csv("./VIIRS_1/archive.csv")
viirs_2 = pd.read_csv("./VIIRS_2/archive.csv")
modis_df = pd.read_csv("./MODIS_1/archive.csv")

viirs_df = pd.concat([viirs_1, viirs_2], ignore_index=True)

# 2. Add sensor labels
viirs_df["sensor"] = "VIIRS"
modis_df["sensor"] = "MODIS"

# 3. Combine.
master_df = pd.concat(
    [modis_df, viirs_df],
    ignore_index=True
)

# 4. Clean data
master_df = master_df.dropna(
    subset=["brightness", "frp", "latitude", "longitude"]
)

master_df["acq_date"] = pd.to_datetime(master_df["acq_date"])
master_df["month"] = master_df["acq_date"].dt.month
master_df["day_of_year"] = master_df["acq_date"].dt.day_of_year
master_df["year"] = master_df["acq_date"].dt.year


# Keep the original confidence values for now.
# Convert them into strings.
master_df["confidence"] = master_df["confidence"].astype(str)

# 5. Define features and output vs input
features = [
    "latitude",
    "longitude",
    "sensor",
    "acq_time",
    "satellite",
    "confidence",
    "frp",
    "daynight",
    "scan",
    "track",
    "month",
    "day_of_year",
    "year",
    "bright_t31"
]

X = master_df[features]
y = master_df["brightness"]

# 6. Define Preprocessing
numeric_features = [
    "latitude", "longitude", "acq_time", "frp", 
    "scan", "track", "month", "year", "day_of_year",
    "bright_t31"
]

categorical_features = [
    "sensor", "satellite", "confidence", "daynight"
]

preprocessor = ColumnTransformer(
    transformers=[
        ("num", "passthrough", numeric_features),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features)
    ]
)

# 7. Model
pipeline = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("model", RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        min_samples_leaf=5,
        max_features=0.7,
        random_state=42,
        n_jobs=-1
    ))
])

# 8. Split and train
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.3,
    random_state=42
)

pipeline.fit(X_train, y_train)

# 9. Evaluate and print results.
predictions = pipeline.predict(X_test)

print("MAE:", mean_absolute_error(y_test, predictions))
print("RMSE:", mean_squared_error(y_test, predictions) ** 0.5)
print("R2:", r2_score(y_test, predictions))


feature_names = pipeline.named_steps[
    "preprocessor"
].get_feature_names_out()

importances = pipeline.named_steps[
    "model"
].feature_importances_

importance_df = pd.DataFrame({
    "feature": feature_names,
    "importance": importances
}).sort_values("importance", ascending=False)

print("Total rows:", len(master_df))
print("Training rows:", len(X_train))
print("Testing rows:", len(X_test))

# Export model results to JSON
importance_df["original_feature"] = (
    importance_df["feature"]
    .str.replace(r"^num__", "", regex=True)
    .str.replace(r"^cat__confidence_.*", "confidence", regex=True)
    .str.replace(r"^cat__daynight_.*", "daynight", regex=True)
    .str.replace(r"^cat__sensor_.*", "sensor", regex=True)
)
grouped_importance = (
    importance_df
    .groupby("original_feature")["importance"]
    .sum()
    .sort_values(ascending=False)
)

mae = mean_absolute_error(y_test, predictions)
rmse = mean_squared_error(y_test, predictions) ** 0.5
r2 = r2_score(y_test, predictions)
results = {
    "model": "Random Forest Regressor",
    "dataset": "NASA FIRMS 2026",
    "metrics": {
        "mae": mae,
        "rmse": rmse,
        "r2": r2
    },
    "dataset_size": {
        "total_rows": len(master_df),
        "training_rows": len(X_train),
        "testing_rows": len(X_test)
    },
    "feature_importance": [
        {"feature": feature, "importance": float(value)}
        for feature, value in grouped_importance.items()
    ]
}

with open("model_results.json", "w") as file:
    json.dump(results, file, indent=4)