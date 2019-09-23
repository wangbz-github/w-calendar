import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import Hammer from 'react-hammerjs'
import memoize from "memoize-one";
import classNames from 'classnames';
import utils from './utils';
import './Calendar.css';

const EnumWeek = ['日', '一', '二', '三', '四', '五', '六'];
const Context = React.createContext();

class CalendarCell extends PureComponent {
  render() {
    const { date, isToday, isFocus, hasTask, disabled } = this.props;
    const className = classNames('w-calendar-cell', {
      'w-calendar-today': isToday,
      'w-calendar-focus': isFocus,
      'w-calendar-task': hasTask,
      "w-text-gray": disabled
    });
    return (
      <Context.Consumer>
        {onDateTap => (
          <span className={className}>
            <Hammer onTap={() => onDateTap({ ...this.props })}>
              <i className="w-cell-text">{date}</i>
            </Hammer>
          </span>
        )}
      </Context.Consumer>
    );
  }
}

class CalendarRow extends PureComponent {
  render() {
    return (
      <div className="w-calendar-row">
        {this.props.rowData.map((cell, day) => (
          <CalendarCell
            {...cell}
            isFocus={this.props.date === cell.date && !cell.disabled}
            day={day}
            key={day}
          />
        ))}
      </div>
    );
  }
}

class CalendarPage extends PureComponent {
  getPageData = memoize(utils.getPageData);

  render() {
    const { year, month, date } = this.props;
    const pageDate = this.getPageData(year, month, this.props.tasks);

    return (
      <li className="w-calendar-page">
        {pageDate.map((row, index) => (
          <CalendarRow rowData={row} date={date} key={index} />
        ))}
      </li>
    );
  }
}

class CalendarWeekTitle extends PureComponent {
  render() {
    return (
      <div className="w-calendar-body-title">
        {EnumWeek.map(day => (
          <span className="w-calendar-day-text" key={day}>{day}</span>
        ))}
      </div>
    );
  }
}

class CalendarBody extends PureComponent {
  getAroundMonth = memoize(utils.getAroundMonth);
  bodyRef = React.createRef();
  timer = null;
  state = {
    transform: 'translateX(0)',
    transition: 'transform 0s ease'
  };
  componentDidMount() {
    this.clientWidth = this.bodyRef.current.clientWidth;
  }

  handlePan = ({ center, deltaX, isFinal }) => {
    //异常滑动
    if (center.x === 0 && center.y === 0 && isFinal) {
      this.setPanEnd();
      return;
    }

    this.setState({
      transform: `translateX(${deltaX}px)`
    });
  };

  handlePanCancel = (event) => {
    this.setPanEnd();
  };

  handlePanEnd = ({ deltaX }) => {
    if (deltaX >= 50) {
      this.setPanEnd(this.clientWidth, -1);
    } else if (deltaX <= -50) {
      this.setPanEnd(-this.clientWidth, 1);
    } else {
      this.setPanEnd();
    }
  };

  setPanEnd(deltaX = 0, diff) {
    this.setState({
      transition: 'transform 0.3s ease',
      transform: `translateX(${deltaX}px)`
    });

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (diff) {
        const { year, month } = utils.getMonth(this.props.year, this.props.month, diff);
        this.props.onSwitch(year, month);
        this.setState({
          transition: 'transform 0s ease',
          transform: 'translateX(0)'
        });
      } else {
        this.setState({
          transition: 'transform 0s ease'
        });
      }
    }, 300);
  }

  render() {
    const { year, month, date } = this.props;
    const { preYear, preMonth, nextYear, nextMonth } = this.getAroundMonth(year, month);
    const className = classNames('w-calendar-page-list', {
      'w-calendar-paning': this.state.paning
    });

    return (
      <div className="w-calendar-body" ref={this.bodyRef}>
        <CalendarWeekTitle />
        <div className="w-calendar-wrap" ref={this.bodyRef}>
          <Hammer onPan={this.handlePan} onPanEnd={this.handlePanEnd} onPanCancel={this.handlePanCancel}
            onPanStart={this.handlePanStart}>
            <ul className={className} style={this.state}>
              <CalendarPage
                key={`${preYear}-${preMonth}`}
                year={preYear}
                month={preMonth}
              />

              <CalendarPage
                key={`${year}-${month}`}
                year={year}
                month={month}
                date={date}
                tasks={this.props.tasks}
              />

              <CalendarPage
                key={`${nextYear}-${nextMonth}`}
                year={nextYear}
                month={nextMonth}
              />
            </ul>
          </Hammer>
        </div>
      </div>
    );
  }
}

class CalendarHead extends PureComponent {
  render() {
    const { year, month, day, btns } = this.props;
    return (
      <div className="w-calendar-head">
        <div className="w-calendar-head-text">
          <p className="w-calendar-head-month">{month}月</p>
          <p className="w-calendar-head-year">{year}年</p>
          <p className="w-calendar-head-day">周{EnumWeek[day]}</p>
        </div>
        <ul className="w-calendar-btns">
          <li className="w-calendar-btn-wrap">
            <button className="w-calendar-btn" onClick={this.props.onBackToday}>今天</button>
          </li>
          {btns && btns.map(btn => (
            <li className="w-calendar-btn-wrap">
              <button className="w-calendar-btn" onClick={btn.onClick}>{btn.name}</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

class Calendar extends Component {
  constructor(props) {
    super(props);
    let [yy, mm, dd] = [];

    if ('value' in props) {
      [yy, mm, dd] = utils.regMatch(props.value);
    } else if ('defaultValue' in props) {
      [yy, mm, dd] = utils.regMatch(props.defaultValue);
    }

    if (!yy || !mm || !dd) {
      [yy, mm, dd] = utils.getToday();
    }

    this.state = {
      year: yy,
      month: mm,
      date: dd,
      day: new Date(yy, mm - 1, 1).getDay()
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!('value' in nextProps)) {
      return null;
    }

    const [yy, mm, dd] = utils.regMatch(nextProps.value);;
    if (!yy || !mm || !dd || (prevState.year === yy && prevState.month === mm && prevState.date === dd)) {
      return null;
    }

    return {
      ...prevState,
      year: yy,
      month: mm,
      date: dd,
      day: new Date(yy, mm - 1, 1).getDay()
    };
  }

  handleDateTap = data => {
    delete data.isFocus;
    this.setState({
      year: data.year,
      month: data.month,
      date: data.date,
      day: data.day
    });
    this.props.onSelect && this.props.onSelect(`${data.year}-${data.month}-${data.date}`, data);
  };

  handleMonthSwitch = (year, month) => {
    this.setState({
      year,
      month,
      date: 1,
      day: new Date(year, month - 1, 1).getDay()
    });

    this.props.onSwitch && this.props.onSwitch(year, month);
  };

  handleTodayClick = () => {
    const [year, month, date] = utils.getToday();
    this.setState({
      year,
      month,
      date,
      day: new Date(year, month - 1, 1).getDay()
    });
  }

  render() {
    const { year, month, date, day } = this.state;
    return (
      <div className="w-calendar">
        <CalendarHead year={year} month={month} day={day} onBackToday={this.handleTodayClick} btns={this.props.btns} />
        <Context.Provider value={this.handleDateTap}>
          <CalendarBody
            year={year} month={month} date={date}
            tasks={this.props.tasks.join(',')}
            onSwitch={this.handleMonthSwitch}
          />
        </Context.Provider>
      </div>
    );
  }
}

Calendar.propTypes = {
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  onSelect: PropTypes.func,
  onSwitch: PropTypes.func,
  tasks: PropTypes.arrayOf(PropTypes.string),
  btns: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    onClick: PropTypes.func
  })),
};

export default Calendar;