import numpy as np

def predict(network, input):
    output = input
    for layer in network:
        output = layer.forward(output)
    return output

def train(network, loss, loss_prime, x_train, y_train, epochs=1000, 
          learning_rate=0.01, verbose=True, clip_value=None):
    for e in range(epochs):
        error = 0
        for x, y in zip(x_train, y_train):
            # forward pass
            output = predict(network, x)

            # error
            error += loss(y, output)

            # backward pass
            grad = loss_prime(y, output)
            
            # Apply gradient clipping if clip_value is provided
            if clip_value:
                grad = np.clip(grad, -clip_value, clip_value)

            # Propagate gradients through the layers
            for layer in reversed(network):
                grad = layer.backward(grad, learning_rate)

        error /= len(x_train)
        if verbose:
            print(f"{e + 1}/{epochs}, error={error}")
