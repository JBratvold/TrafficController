class Layer {
    constructor() {
        this.input = null;
        this.output = null;
    }

    forward(input) {
        // To be implemented in subclasses
    }

    backward(outputGradient, learningRate) {
        // To be implemented in subclasses
    }
}