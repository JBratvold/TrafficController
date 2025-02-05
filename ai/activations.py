import numpy as np
from .activation import Activation

class Sigmoid(Activation):
    def __init__(self):
        def sigmoid(x):
            x = np.clip(x, -500, 500)
            return 1 / (1 + np.exp(-x))

        def sigmoid_prime(x):
            return sigmoid(x) * (1 - sigmoid(x))

        super().__init__(sigmoid, sigmoid_prime)

class ReLU(Activation):
    def __init__(self):
        def relu(x):
            return np.maximum(0, x) 

        def relu_prime(x):
            return (x > 0).astype(float)  

        super().__init__(relu, relu_prime)