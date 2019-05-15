const getDate = (isoDate) => {

    const fullDate = new Date(isoDate);

    const year = fullDate.getFullYear();
    let month = fullDate.getMonth() + 1;
    let date = fullDate.getDate();

    if (date < 10) {
        date = `0${date}`;
    }
    if (month < 10) {
        month = `0${month}`;
    }

    return `${date}.${month}.${year}`;

}

export default getDate;
