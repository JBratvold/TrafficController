import numpy as np
import time
from .dense import Dense
from .activations import Sigmoid,ReLU
from .losses import binary_cross_entropy,binary_cross_entropy_prime
from .network import train, predict
from .data import splitIntoXY,getNumberOfSamples,getNumberOfFeatures

# Background
'''
The AI controls a traffic light at a 4 way intersection. 
The AI has two options for the traffic light:

1 - Switch the traffic light colours (red <-> green)
0 - Keep the light as is

The AI will decide what to do based on 3 options:

[r,g,t]

r - The number of cars at the red light
g - The number of cars at the green light (that are in the progress of proceeding)
t - The time in seconds since the light was last changed
'''

# --- Constants ---
EPOCHS = 250
LEARNING_RATE = 0.001
CLIP_VALUE = None
VERBOSE = False
INDEX_TO_SPLIT_X_AND_Y = 3 # Split Data Ex: [x,x,x,x,y,y] (index:4)

raw_training_data = np.array([
    [1, 10, 2, 0],  # Red: 1, Green: 10, Time: 2, Action: Keep (0)
    [3, 15, 10, 1],  # Red: 3, Green: 15, Time: 10, Action: Change (1)
    [5, 8, 5, 0],    # Red: 5, Green: 8, Time: 5, Action: Keep (0)
    [10, 5, 7, 1],   # Red: 10, Green: 5, Time: 7, Action: Change (1)
    [0, 0, 10, 0],   # Red: 0, Green: 0, Time: 10, Action: Keep (0)
    [6, 4, 3, 1],    # Red: 6, Green: 4, Time: 3, Action: Change (1)
    [2, 7, 4, 0],    # Red: 2, Green: 7, Time: 4, Action: Keep (0)
    [8, 12, 15, 1],  # Red: 8, Green: 12, Time: 15, Action: Change (1)
    [9, 1, 30, 1],   # Red: 9, Green: 1, Time: 30, Action: Change (1)
    [4, 9, 6, 0],    # Red: 4, Green: 9, Time: 6, Action: Keep (0)
    [7, 2, 12, 1],   # Red: 7, Green: 2, Time: 12, Action: Change (1)
    [3, 3, 5, 0],    # Red: 3, Green: 3, Time: 5, Action: Keep (0)
    [11, 10, 8, 1],  # Red: 11, Green: 10, Time: 8, Action: Change (1)
    [0, 0, 0, 0],    # Red: 0, Green: 0, Time: 0, Action: Keep (0)
    [6, 6, 4, 1],    # Red: 6, Green: 6, Time: 4, Action: Change (1)
    [15, 0, 1, 1],   # Red: 15, Green: 0, Time: 1, Action: Change (1)
    [20, 1, 2, 1],   # Red: 20, Green: 1, Time: 2, Action: Change (1)
    [0, 5, 10, 0],   # Red: 0, Green: 5, Time: 10, Action: Keep (0)
    [10, 3, 8, 1],   # Red: 10, Green: 3, Time: 8, Action: Change (1)
    [2, 4, 9, 0],    # Red: 2, Green: 4, Time: 9, Action: Keep (0)
    [1, 2, 3, 0],    # Red: 1, Green: 2, Time: 3, Action: Keep (0)
    [4, 12, 6, 1],   # Red: 4, Green: 12, Time: 6, Action: Change (1)
    [2, 5, 4, 0],    # Red: 2, Green: 5, Time: 4, Action: Keep (0)
    [3, 9, 5, 1],    # Red: 3, Green: 9, Time: 5, Action: Change (1)
    [7, 1, 8, 0],    # Red: 7, Green: 1, Time: 8, Action: Keep (0)
    [5, 10, 7, 1],   # Red: 5, Green: 10, Time: 7, Action: Change (1)
    [9, 6, 4, 1],    # Red: 9, Green: 6, Time: 4, Action: Change (1)
    [0, 8, 2, 0],    # Red: 0, Green: 8, Time: 2, Action: Keep (0)
    [11, 14, 12, 1], # Red: 11, Green: 14, Time: 12, Action: Change (1)
    [3, 2, 15, 0],   # Red: 3, Green: 2, Time: 15, Action: Keep (0)
    [12, 9, 5, 1],   # Red: 12, Green: 9, Time: 5, Action: Change (1)
    [0, 0, 5, 0],    # Red: 0, Green: 0, Time: 5, Action: Keep (0)
    [6, 5, 10, 1],   # Red: 6, Green: 5, Time: 10, Action: Change (1)
    [8, 3, 12, 0],   # Red: 8, Green: 3, Time: 12, Action: Keep (0)
    [14, 2, 4, 1],   # Red: 14, Green: 2, Time: 4, Action: Change (1)
    [0, 0, 6, 0],    # Red: 0, Green: 0, Time: 6, Action: Keep (0)
    [9, 7, 11, 1],   # Red: 9, Green: 7, Time: 11, Action: Change (1)
    [5, 3, 9, 0],    # Red: 5, Green: 3, Time: 9, Action: Keep (0)
    [7, 9, 2, 1],    # Red: 7, Green: 9, Time: 2, Action: Change (1)
    [10, 10, 5, 1],  # Red: 10, Green: 10, Time: 5, Action: Change (1)
    [0, 0, 0, 0],    # Red: 0, Green: 0, Time: 0, Action: Keep (0)
    [6, 3, 14, 1],   # Red: 6, Green: 3, Time: 14, Action: Change (1)
    [3, 8, 6, 0],    # Red: 3, Green: 8, Time: 6, Action: Keep (0)
    [12, 4, 7, 1],   # Red: 12, Green: 4, Time: 7, Action: Change (1)
    [15, 6, 3, 1],   # Red: 15, Green: 6, Time: 3, Action: Change (1)
    [0, 1, 4, 0],    # Red: 0, Green: 1, Time: 4, Action: Keep (0)
    [4, 6, 10, 0],   # Red: 4, Green: 6, Time: 10, Action: Keep (0)
    [8, 4, 13, 1],   # Red: 8, Green: 4, Time: 13, Action: Change (1)
    [9, 10, 7, 1],   # Red: 9, Green: 10, Time: 7, Action: Change (1)
    [0, 0, 2, 0],    # Red: 0, Green: 0, Time: 2, Action: Keep (0)
    [10, 2, 9, 1],   # Red: 10, Green: 2, Time: 9, Action: Change (1)
    [3, 12, 8, 0],   # Red: 3, Green: 12, Time: 8, Action: Keep (0)
    [14, 5, 6, 1],   # Red: 14, Green: 5, Time: 6, Action: Change (1)
    [7, 4, 10, 0],   # Red: 7, Green: 4, Time: 10, Action: Keep (0)
    [11, 3, 5, 1],   # Red: 11, Green: 3, Time: 5, Action: Change (1)
    [5, 2, 4, 0],    # Red: 5, Green: 2, Time: 4, Action: Keep (0)
    [5, 5, 30, 1], 
    [5, 5, 40, 1], 
    [10, 10, 50, 1],
    [1, 21, 18, 0],
    [2, 17, 15, 0],
    [3, 22, 11, 0],
    [5, 15, 30, 0],
    [7, 15, 40, 1],
    [3, 0, 5, 1],
    [0, 0, 75, 0],
    [1, 0, 5, 1],
    [2, 0, 2, 1],
    [2, 0, 20, 1],
    [4, 0, 15, 1],
    [1, 0, 2, 1],
])

X,Y = splitIntoXY(raw_training_data,INDEX_TO_SPLIT_X_AND_Y)
X = np.reshape(X,(getNumberOfSamples(X),getNumberOfFeatures(X),1))
Y = np.reshape(Y,(getNumberOfSamples(Y),getNumberOfFeatures(Y),1))

# --- Neural Network Construction Function ---
def build_network():
    return [
        Dense(3, 6),  
        ReLU(),
        Dense(6, 1),  
        Sigmoid()
    ]

# --- Train Function ---
def train_network(X, Y):
    network = build_network()
    start_time = time.time()
    train(network, binary_cross_entropy, binary_cross_entropy_prime, X, Y, epochs=EPOCHS, 
          learning_rate=LEARNING_RATE, verbose=VERBOSE, clip_value=CLIP_VALUE)
    # Calculate training time
    end_time = time.time()
    training_time = end_time - start_time
    return network, training_time

# --- Main Execution ---
trained_network, training_time = train_network(X, Y) 

def queryNN(redCars,greenCars,secondsSinceFlipped):
    values_to_predict = [[redCars], [greenCars], [secondsSinceFlipped]]
    prediction_result = predict(trained_network, values_to_predict)
    prediction_raw_value = prediction_result[0][0]
    action = 1 if round(prediction_raw_value) == 1 else 0
    return action