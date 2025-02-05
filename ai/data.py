import numpy as np

def splitIntoXY(data,splitIndex):
    data = np.array(data)

    X = data[:, :splitIndex]  # First part of the row to X
    Y = data[:, splitIndex:]  # Second part of the row to Y
    
    return X,Y

# Returns the number of samples in my dataset (rows)
def getNumberOfSamples(dataArray):
    return dataArray.shape[0]

# Returns the number of features in my dataset (columns)
def getNumberOfFeatures(dataArray):
    return dataArray.shape[1]

