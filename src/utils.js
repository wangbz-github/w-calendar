const dateReg = /(^\d{4})[\-\/](\d{1,2})[\-\/](\d{1,2})$/;

const utils = {
  regTest: dateReg.test,
  regMatch(text) {
    const [, yy, mm, dd] = text.match(dateReg);
    return [parseInt(yy), parseInt(mm), parseInt(dd)];
  },
  getToday() {
    let today = new Date();
    return [today.getFullYear(), today.getMonth() + 1, today.getDate()];
  },
  getMonth(year, month, diff = 0) {
    year += parseInt(diff / 12);
    month += diff % 12;
    if (month > 12) {
      year += 1;
      month -= 12;
    } else if (month < 1) {
      year -= 1;
      month += 12;
    }

    return {
      year,
      month,
      total: new Date(year, month, 0).getDate()
    };
  },
  getAroundMonth(year, month) {
    const { year: preYear, month: preMonth } = utils.getMonth(year, month, -1);
    const { year: nextYear, month: nextMonth } = utils.getMonth(year, month, 1);
    return { preYear, preMonth, nextYear, nextMonth };
  },
  getPageData(year, month, tasks) {
    const pageData = [];
    let rowIndex = 0;

    //补齐上个月的日期
    const startDay = new Date(year, month - 1, 1).getDay(); //当前月第一天是周几
    let { year: preYear, month: preMonth, total: preTotal } = utils.getMonth(year, month, -1);
    for (let i = 0; i < startDay; i++) {
      let temp = { year: preYear, month: preMonth, date: preTotal--, disabled: true };
      if (pageData[rowIndex]) {
        pageData[rowIndex].unshift(temp);
      } else {
        pageData[rowIndex] = [temp];
      }
    }

    //填充当前月日期
    const thisTotal = new Date(year, month, 0).getDate();
    const [toYear, toMonth, today] = utils.getToday();
    for (let i = 1; i <= thisTotal; i++) {
      let temp = { year, month, date: i };

      if (tasks) {
        const regExp = new RegExp(`${year}[\-\/]0?${month}[\-\/]0?${i}($|,)`);
        temp.hasTask = regExp.test(tasks);
      }
      if (year === toYear && month === toMonth && i === today) {
        temp.isToday = true;
      }




      if (pageData[rowIndex] && pageData[rowIndex].length === 7) {
        rowIndex++;
      }

      if (pageData[rowIndex]) {
        pageData[rowIndex].push(temp);
      } else {
        pageData[rowIndex] = [temp];
      }
    }

    //补齐下个月的日期
    const { year: nextYear, month: nextMonth } = utils.getMonth(year, month, 1);
    for (let i = 1; rowIndex < 5 || pageData[rowIndex].length < 7; i++) {
      let temp = { year: nextYear, month: nextMonth, date: i, disabled: true };

      if (pageData[rowIndex] && pageData[rowIndex].length === 7) {
        rowIndex++;
      }

      if (pageData[rowIndex]) {
        pageData[rowIndex].push(temp);
      } else {
        pageData[rowIndex] = [temp];
      }
    }

    return pageData;
  }
};

export default utils;