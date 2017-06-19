/**
 * Created by User on 18.06.2017.
 */
const timeDifference = (date1, date2) => Math.abs(+date2 - +date1);
const UNITS = {
    year: 'year',
    month: 'month',
    day: 'day',
    hour: 'hour',
    minute: 'minute',
    second: 'second',
    millisecond: 'millisecond'
};
const difference = (date1, date2, unit) => {
    unit = unit || 'millisecond';
    switch(unit){
        case UNITS.year:
            return ~~( timeDifference(date1, date2)/ (1000 * 60 * 60 * 24 * 365));
        case UNITS.month:
            return ~~( timeDifference(date1, date2)/ (1000 * 60 * 60 * 24 * 31));
        case UNITS.day:
            return ~~( timeDifference(date1, date2)/ (1000 * 60 * 60 * 24));
        case UNITS.hour:
            return ~~( timeDifference(date1, date2)/ (1000 * 60 * 60));
        case UNITS.minute:
            return ~~( timeDifference(date1, date2)/ (1000 * 60));
        case UNITS.second:
            return ~~( timeDifference(date1, date2)/ (1000));
        case UNITS.millisecond:
            return ~~( timeDifference(date1, date2));
        default:
            return ~~( timeDifference(date1, date2));
    }
};

module.exports = difference;