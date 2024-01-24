//jshint esversion:6
// export default getDate;
exports.getDate = function() {
    let today = new Date();

    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    // let currentDay = today.getDay();
    let day = today.toLocaleDateString("en-US", options);
    return day;
};
// module.exports.getDate = getDate;

// function getDate() {
//     let today = new Date();

//     let options = {
//         weekday: "long",
//         day: "numeric",
//         month: "long"
//     };

//     // let currentDay = today.getDay();
//     let day = today.toLocaleDateString("en-US", options);
//     return day;
// }

// module.exports.getDay = getDay;
module.exports.getDay = getDay;

function getDay() {
    let today = new Date();

    let options = {
        weekday: "long",
    };

    // let currentDay = today.getDay();
    let day = today.toLocaleDateString("en-US", options);
    return day;
}
