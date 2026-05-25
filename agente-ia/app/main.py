from fastapi import FastAPI


app = FastAPI()

@app.get("/")
def home():
    return{"message": "Serviço de IA rodando"}