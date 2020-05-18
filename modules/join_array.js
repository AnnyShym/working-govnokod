const joinArrayIntoQuery = (array, column) => {

    let arr = [];
    for (let i = 0; i < array.length; i++) {
        if (array[i] !== " ") {
            arr.push(array[i]);
        }
    }

    let str = "";
    if (arr.length > 1) {
        str = arr.join(", ");
    }
    else {
        str = arr[0];
    }

    str = `${column} IN(${str})`;

    return { str: str, count: arr.length };

}

module.exports = joinArrayIntoQuery;
