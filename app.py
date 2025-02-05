from flask import Flask, render_template

app = Flask(__name__)

# Define a route for the home page
@app.route('/')
def home():
    return render_template('index.html')  # Render the index.html template

# Run the app
if __name__ == '__main__':
    app.run(debug=True)