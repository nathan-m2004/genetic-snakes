This was supposed to be a Solana Hackathon project, the idea was making a NFT for each Snake. Might still do it but not in time for the hackathon :(

WORKING PROGRESS

the brains
--

I took the basis from my `/Flappy` Neural Network and added a few things. The original NN had only 2 weight matrices, I added one more hidden layer and one more bias. 
It was a FNN, I added recurrence to the algorithm, the last output of the NN becomes the input for the next one.
And finally I changed the `sigmoid`function to a `tanh`function, and added a `softmax` function to normalize the output.
