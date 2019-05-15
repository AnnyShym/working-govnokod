const addZeros = (str, length) => {
    return (length - str.length > 0) ?
            new Array(length - str.length + 1).join('0') + str
        :
            str;
}

export default addZeros;
