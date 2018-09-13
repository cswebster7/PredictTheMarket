import 'whatwg-fetch';
import React, { Component } from 'react';
import * as d3 from '../../libraries/d3Library/d3v4.js';
import { Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Select from 'react-select';

class Dragchart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      debutData: {},
      showErrorModal: false,
      averageData: [
      ],
      showButtonFlag: false,
      guessGraphData: {},
      showAverageGraph: false,
      dragwRangeInfo: {},
      seeAverageButtonState: true,
      data: [
        { date: '2018-06-14', vol: 73.6 },
        { date: '2018-06-24', vol: 89 },
        { date: '2018-07-14', vol: 55 },
        { date: '2018-07-24', vol: 65 },
        { date: '2018-08-14', vol: 70 },
        { date: '2018-09-13', vol: 55 }
    ]
    };
  }

  drawGraphInfo = () => {
    let { data } = this.state;

    var parseTime = d3.timeParse("%Y-%m-%d");
    data.forEach(function(d) {
        d.date = parseTime(d.date);
    });

    var today = new Date();
    let start_date = today.setMonth(today.getMonth()-3);
    let end_date = today.setMonth(today.getMonth()+6);
    today.setMonth(today.getMonth()-3);
    let tomorrow = today.setDate(today.getDate()+1);
    today.setDate(today.getDate()-1);
    
    let averageData = [];
    for (let date = new Date(today.valueOf()); date <= end_date; date.setDate(date.getDate()+1)) {
      if (date.valueOf() === today.valueOf()) {
        averageData.push({
          date: date.valueOf(),
          vol: data[data.length - 1].vol
        });
      } else {
        averageData.push({
          date: date.valueOf(),
          vol: 0
        });
      }
    }
    // let { averageData } = this.state;
    let ƒ = d3.f;

    let sel = d3.select('#drag').html('');

    let dragwRangeInfo = d3.conventions({
      parentSel: sel,
      totalWidth: sel.node().offsetWidth,
      height: 400,
      margin: { left: 50, right: 50, top: 30, bottom: 30 }
    });
    this.setState({dragwRangeInfo});

    dragwRangeInfo.svg.append('rect').at({ width: dragwRangeInfo.width, height: dragwRangeInfo.height, opacity: 0 });

    dragwRangeInfo.x.domain([start_date, end_date]);
    dragwRangeInfo.y.domain([0, d3.max(data, function(d) { return d.vol; }) * 2]);

    dragwRangeInfo.xAxis.tickFormat(d3.timeFormat("%Y-%m-%d"));
    dragwRangeInfo.yAxis.ticks(5).tickFormat(d => '$' + d);

    let area = d3
      .area()
      .x(ƒ('date', dragwRangeInfo.x))
      .y0(ƒ('vol', dragwRangeInfo.y))
      .y1(dragwRangeInfo.height);
    let line = d3
      .area()
      .x(ƒ('date', dragwRangeInfo.x))
      .y(ƒ('vol', dragwRangeInfo.y));

    let clipRect = dragwRangeInfo.svg
      .append('clipPath#clip')
      .append('rect')
      .at({ width: dragwRangeInfo.x(today.valueOf()), height: dragwRangeInfo.height});

    let correctSel = dragwRangeInfo.svg.append('g').attr('clip-path', 'url(#clip)');
    correctSel.append('path.area').at({ d: area(data) });
    correctSel.append('path.line').at({ d: line(data) });

    let correctSelr = dragwRangeInfo.svg.append('g').attr('clip-path', 'url(#clip)');
    this.setState({guessGraphData: correctSelr});

    let userGraphDataSel = dragwRangeInfo.svg.append('path.your-line');
    dragwRangeInfo.drawAxis();

    let userGraphData = averageData
      .map(function(d) {
        return { date: d.date, vol: d.vol, defined: 0 };
      })
      .filter(function(d) {
        if (d.date === today.valueOf()) d.defined = true;
        return d.date >= today.valueOf();
      });

    const that = this;

    let completed = false;
    let drag = d3.drag().on('drag', function() {
      let pos = d3.mouse(this);
      let date = clamp(today.valueOf(), end_date, dragwRangeInfo.x.invert(pos[0]));
      let vol = clamp(0, dragwRangeInfo.y.domain()[1], dragwRangeInfo.y.invert(pos[1]));

      userGraphData.forEach(function(d) {
        if (Math.abs(d.date - date) < 43200000) {
          d.vol = vol;
          d.defined = true;
        }
      });

      userGraphDataSel.at({ d: line.defined(ƒ('defined'))(userGraphData) });

      if (!completed && d3.mean(userGraphData, ƒ('defined')) === 1) {
        that.setState({debutData: userGraphData});
        completed = true;
        clipRect
          .transition()
          .duration(5000)
          .attr('width', dragwRangeInfo.x(end_date));
      }
    });

    dragwRangeInfo.svg.call(drag);
    function clamp(a, b, c) {
      return Math.max(a, Math.min(b, c));
    }
  }

  componentDidMount() {
    this.drawGraphInfo();
    axios.get('https://api.iextrading.com/1.0/ref-data/symbols').then(res => {
      this.setState({
        symbols: res.data.map(item => ({
          label: item.name,
          value: item.symbol
        }))
      });
    });
  }

  saveDebutValue = (debutValue) => {
    let idToken = localStorage.getItem(
      "token"
    );
    let requestData = {
      data: debutValue
    };
    console.log(requestData)
    axios({
      method: "post",
      url:
        "https://u2qgvn2qw7.execute-api.us-west-2.amazonaws.com/dev/getPredictionDev",
      headers: { Authorization: idToken,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Credentials": true},
      data: requestData
    })
    .then((res) => {
      alert("Your process has been successfully completed.!!!");
      let averages = res.data;
      localStorage.setItem('averages', JSON.stringify(averages.averages));
      this.setState({seeAverageButtonState: false});
    })
    .catch((err) => {
      alert(err);
    })
  }

  onSubmit = () => {
    if (this.state.debutData)
    if (Object.keys(this.state.debutData).length > 0) {
      this.saveDebutValue(this.state.debutData);
		console.log(this.state.debutData);
    } else {
      this.setState({showErrorModal: true});
    }
  }

  handleDismiss = () => {
    this.setState({showErrorModal: false});
  }

  deleteDb = () => {
    let idToken = localStorage.getItem(
      "token"
    );
    const headers = {
      Authorization: idToken
    };
    axios
      .delete(
        "https://30xqj3oo9d.execute-api.us-west-2.amazonaws.com/dev/deleteDBdev",
        { headers }
      )
      .then(res => {
        let status = res.data;
        console.log(status);

        if (status.status === "success") {
          alert("Successfully Deleted the DB contents......");
        }
      })

    .catch(err => {
      alert(err);
    })
  }

  getAverage = () => {
    let avrgs = [];
    let averages = JSON.parse(localStorage.getItem('averages'));
    Object.keys(averages).forEach( key => {
      avrgs.push({
        year: parseInt(key, 10),
        vol: averages[key]
      })
    });
    this.setState({averageData: avrgs, showAverageGraph: true});
  }



  drawAverageGraphRender(averageData) {
    d3.select('.arear').remove();
    d3.select('.liner').remove();
    let { dragwRangeInfo, guessGraphData } = this.state;

    let ƒ = d3.f;

    const arear = d3
      .area()
      .x(ƒ('date', dragwRangeInfo.x))
      .y0(ƒ('vol', dragwRangeInfo.y))
      .y1(dragwRangeInfo.height);

    const liner = d3
      .area()
      .x(ƒ('date', dragwRangeInfo.x))
      .y(ƒ('vol', dragwRangeInfo.y));

    guessGraphData.append('path.arear').at({ d: arear(averageData)});
    guessGraphData.append('path.liner').at({ d: liner(averageData)});
  };

  handleSelectSymbol = (item) => {
    axios.get(`https://api.iextrading.com/1.0/stock/${item.value}/chart/3m`).then(res => {
      this.setState({data: res.data.map(data => ({ date: data.date, vol: data.volume }))});
      this.drawGraphInfo();
    });
  };

  render() {
    const { seeAverageButtonState, averageData, symbols } = this.state;
    return (
        <div className="mainWidget">
          {this.state.showErrorModal === true && (
            <Alert bsStyle="danger">
              <strong>Please draw the Prediction graph</strong>
              <Button bsStyle='danger' className="error-message" onClick={this.handleDismiss}>Close</Button>
            </Alert>
          )}

          <Select 
            options={symbols}
            onChange={this.handleSelectSymbol}
            placeholder='Search...'
          />

          <div>
            {/*<p>Predict the Market</p>*/}

            <Button bsStyle='primary' className='submit-prediction' onClick={this.onSubmit}>Submit Prediction</Button>
            <Button bsStyle='primary' className='see-average' disabled={seeAverageButtonState} onClick={this.getAverage}>See Average</Button>
            <Button bsStyle='danger' className='clear-db' onClick={this.deleteDb}>Delete All Data</Button>
            <div id="drag"></div>
          </div>

          {this.state.showAverageGraph === true && this.drawAverageGraphRender(averageData)}
        </div>
      );
    }
}

export default Dragchart;




