# w-calendar

##### 移动端React日历组件  

<img src="https://raw.githubusercontent.com/wangbz-github/image-folder/master/w-calendar.png" width="350"/>  

----
### API
属性|类型|默认|说明
---|:--:|---:|---:
defaultValue | string('2019-09-23') | - | 默认选中的日期
value | string('2019-09-23') | - | 选中的日期
tasks | Array&lt;string&gt; | - | 显示有任务的日期
onSelect | (dateText, dateObj) => void | - | 选择日期时的回调
onSwitch | (year, month) => void | - | 切换月份时的回调
btns | Array&lt;object&gt; | - | 右上角按钮

----
  
### Code 演示
```
import React from 'react';
import ReactDOM from 'react-dom';
import Calendar from 'w-alendar';

function App() {

  return (
    <React.Fragment>
      <Calendar
        tasks={['2019-09/25', '2019-9-17']}
        defaultValue="2019-9-13"
        onSelect={(text, date) => { console.log(text, date) }}
        onSwitch={(year, month) => { console.log(year, month) }}
        btns={[{ name: 'my-btn', onClick: () => { console.log('clicked') } }]}
      />
    </React.Fragment>
  );
}

ReactDOM.render(<App />, document.getElementById('app'));
```

