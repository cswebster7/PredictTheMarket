import 'whatwg-fetch';
import React, { Component } from 'react';
import * as d3 from '../../libraries/d3Library/d3v4.js';
import { Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
class Dragchart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      debutData: {},
      showErrorModal: false,
      averageData: [],
      showButtonFlag: false,
    };
  }

  componentDidMount() {
    let data = [
      { year: 2001, debt: 31.4 },
      { year: 2002, debt: 32.6 },
      { year: 2003, debt: 34.5 },
      { year: 2004, debt: 35.5 },
      { year: 2005, debt: 35.6 },
      { year: 2006, debt: 35.3 },
      { year: 2007, debt: 35.2 },
      { year: 2008, debt: 39.3 },
      { year: 2009, debt: 52.3 },
      { year: 2010, debt: 60.9 },
      { year: 2011, debt: 65.9 },
      { year: 2012, debt: 70.4 },
      { year: 2013, debt: 72.6 },
      { year: 2014, debt: 74.4 },
      { year: 2015, debt: 73.6 },
    ];

    axios('https://cors-anywhere.herokuapp.com/https://gcfvlmkr59.execute-api.us-west-2.amazonaws.com/beta/getAverage', {
      headers: {
        'Accept': 'application/json',
      }
    })
      .then(res => {
        let averageData = JSON.parse(res.data);
        this.setState({ averageData: averageData.averages, showButtonFlag: true }, () => {
          let { averageData } = this.state;

          let ƒ = d3.f;

          let sel = d3.select('#drag').html('');

          let dragwRangeInfo = d3.conventions({
            parentSel: sel,
            totalWidth: sel.node().offsetWidth,
            height: 400,
            margin: { left: 50, right: 50, top: 30, bottom: 30 }
          });

          dragwRangeInfo.svg.append('rect').at({ width: dragwRangeInfo.width, height: dragwRangeInfo.height, opacity: 0 });

          dragwRangeInfo.x.domain([2001, 2025]);
          dragwRangeInfo.y.domain([0, 100]);

          dragwRangeInfo.xAxis.ticks(6).tickFormat(ƒ());
          dragwRangeInfo.yAxis.ticks(5).tickFormat(d => '$' + d);

          let area = d3
            .area()
            .x(ƒ('year', dragwRangeInfo.x))
            .y0(ƒ('debt', dragwRangeInfo.y))
            .y1(dragwRangeInfo.height);
          let line = d3
            .area()
            .x(ƒ('year', dragwRangeInfo.x))
            .y(ƒ('debt', dragwRangeInfo.y));

          let clipRect = dragwRangeInfo.svg
            .append('clipPath#clip')
            .append('rect')
            .at({ width: dragwRangeInfo.x(2015) - 2, height: dragwRangeInfo.height});

          let arear = d3
            .area()
            .x(ƒ('year', dragwRangeInfo.x))
            .y0(ƒ('debt', dragwRangeInfo.y))
            .y1(dragwRangeInfo.height);

          let liner = d3
            .area()
            .x(ƒ('year', dragwRangeInfo.x))
            .y(ƒ('debt', dragwRangeInfo.y));

          let correctSel = dragwRangeInfo.svg.append('g').attr('clip-path', 'url(#clip)');

          correctSel.append('path.area').at({ d: area(data) });
          correctSel.append('path.line').at({ d: line(data) });

          let correctSelr = dragwRangeInfo.svg.append('g').attr('clip-path', 'url(#clip)');

          correctSelr.append('path.arear').at({ d: arear(averageData)});
          correctSelr.append('path.liner').at({ d: liner(averageData)});

          let userGraphDataSel = dragwRangeInfo.svg.append('path.your-line');
          dragwRangeInfo.drawAxis();

          let userGraphData = averageData
            .map(function(d) {
              return { year: d.year, debt: d.debt, defined: 0 };
            })
            .filter(function(d) {
              if (d.year === 2015) d.defined = true;
              return d.year >= 2015;
            });

          const that = this;

          let completed = false;
          let drag = d3.drag().on('drag', function() {
            let pos = d3.mouse(this);
            let year = clamp(2016, 2025, dragwRangeInfo.x.invert(pos[0]));
            let debt = clamp(0, dragwRangeInfo.y.domain()[1], dragwRangeInfo.y.invert(pos[1]));

            userGraphData.forEach(function(d) {
              if (Math.abs(d.year - year) < 0.5) {
                d.debt = debt;
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
                .attr('width', dragwRangeInfo.x(2025));
            }
          });

          dragwRangeInfo.svg.call(drag);
          function clamp(a, b, c) {
            return Math.max(a, Math.min(b, c));
          }
        })
      })
      .catch(err => {
        alert(err);
      });
  }

  saveDebutValue = (debutValue) => {
    let requestData = {
      data: debutValue
    };
    axios({
      method: 'post',
      url: 'https://2i0dcos0qe.execute-api.us-west-2.amazonaws.com/beta/predictionapi',
      data: requestData
    })
    .then((res) => {
      if (res.status === 200) {
        let averages = res.data.body;
        localStorage.setItem('averages', JSON.stringify(averages));
      }
    })
    .catch((err) => {
      alert(err);
    })
  }

  onSubmit = () => {
    if (this.state.debutData)
    if (Object.keys(this.state.debutData).length > 0) {
      this.saveDebutValue(this.state.debutData);
    } else {
      this.setState({showErrorModal: true});
    }
  }

  handleDismiss = () => {
    this.setState({showErrorModal: false});
  }

  getAverage = () => {
    let avrgs = [];
    let averages = JSON.parse(localStorage.getItem('averages'));
    Object.keys(averages).forEach(function(key) {
      avrgs.push({
        year: parseInt(key, 10),
        debt: averages[key]
      })
    });
    this.setState({averageData: avrgs});
  }
  deleteDb = () => {
    console.log("----------Delete DB----------");
  }

  render() {

    return (
        <div className="mainWidget">
          {this.state.showErrorModal === true && (
            <Alert bsStyle="danger">
              <strong>Please draw the Prediction graph</strong>
              <Button bsStyle='danger' className="error-message" onClick={this.handleDismiss}>Close</Button>
            </Alert>
          )}
          {this.state.showButtonFlag === true && (
            <div>
              <p>Predict the Market</p>
              <Button bsStyle='primary' className='submit-prediction' onClick={this.onSubmit}>Submit Prediction</Button>
              <Button bsStyle='primary' className='see-average' onClick={this.getAverage}>See Average</Button>
              <Button bsStyle='danger' className='clear-db' onClick={this.deleteDb}>Delete All Data</Button>
              <div id="drag"></div>
            </div>
          )}
        </div>
      );
    }
}

export default Dragchart;
