from flask import Flask, render_template, request
from ai.TrafficController_ai import queryNN

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def index():
    prediction = None
    if request.method == "POST":
        numRedCars = int(request.form["red_cars"])
        numGreenCars = int(request.form["green_cars"])
        timeSinceChanged = int(request.form["time_since_changed"])
        
        prediction = queryNN(numRedCars, numGreenCars, timeSinceChanged)
        print("Prediction: ",prediction)
    return render_template("index.html", prediction=prediction)

if __name__ == "__main__":
    app.run(debug=True)
