from flask import Flask, render_template, request,  jsonify
from ai.TrafficController_ai import queryNN

app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html")

# Route to accept traffic data from JS (for sending predictions)
@app.route('/traffic_data', methods=['POST'])
def receive_traffic_data():
    # Get the JSON data sent by JS
    data = request.get_json()

    # Extract the data from the JSON object
    redCars = data.get("red", 0)  # Number of cars at a red light
    greenCars = data.get("green", 0)  # Number of cars at a green light
    timeSinceChanged = data.get("seconds", 0)  # Time since the light changed

    # Query the neural network with the received data
    prediction = queryNN(redCars, greenCars, timeSinceChanged)
    
    # Return the prediction as a JSON response
    return jsonify({"prediction": prediction})

if __name__ == "__main__":
    app.run(debug=False)
