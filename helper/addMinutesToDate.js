const addMinutesToDate = (minute) => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minute);
  return now;
};

export default addMinutesToDate;

// var s = new Date();
// console.log(s)
// s.setMinutes(s.getMinutes()+5);

// console.log(s)
