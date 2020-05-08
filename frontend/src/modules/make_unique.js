const makeUnique = (value, index, self) => { 
    return self.indexOf(value) === index;
}

export default makeUnique;