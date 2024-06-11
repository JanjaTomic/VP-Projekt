import pandas as pd

data = pd.read_csv('cleaned_data.csv')
cleaned_data = data.dropna()
print(cleaned_data)
cleaned_data.to_csv('cleaned_cleaned_data.csv', index=False)