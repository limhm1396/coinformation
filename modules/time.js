exports.getTTL = () => {
    const date = new Date();
    const newDate = new Date();

    newDate.setDate(newDate.getDate() + 1);
    newDate.setHours(0);
    newDate.setMinutes(0);
    newDate.setSeconds(1);
    newDate.setMilliseconds(0);

    const diff_second = (newDate - date) / 1000;

    return Math.floor(diff_second);
};

exports.sleep = (ms) => {
    return new Promise((r) => setTimeout(r, ms));
}