import React from 'react';
import ReactDOM from 'react-dom';
import Calendar from '../src/Calendar';

function App() {


  return (
    <React.Fragment>
      <Calendar
        tasks={['2019-09/25', '2019-9-17']}
        defaultValue="2019-9-13"
        onSelect={(text, yy, mm, dd) => { console.log(text, yy, mm, dd) }}
        onSwitch={(yy, mm) => { console.log(yy, mm) }}
        btns={[{ name: 'my-btn', onClick: () => { console.log('clicked') } }]}
      />
    </React.Fragment>
  );
}

ReactDOM.render(<App />, document.getElementById('app'));
