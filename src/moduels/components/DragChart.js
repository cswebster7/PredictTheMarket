import React, { Component } from 'react';
import * as d3 from '../../libraries/d3Library/d3v4.js';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
class Dragchart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      debutData: {}
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

    let datar = [
      { year: 2015, debt: 73.6 },
      { year: 2016, debt: 60.9 },
      { year: 2017, debt: 65.9 },
      { year: 2018, debt: 70.4 },
      { year: 2019, debt: 72.6 },
      { year: 2020, debt: 74.4 },
      { year: 2021, debt: 73.6 },
      { year: 2022, debt: 60.9 },
      { year: 2023, debt: 65.9 },
      { year: 2024, debt: 70.4 },
      { year: 2025, debt: 72.6 }
    ];

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

    correctSelr.append('path.arear').at({ d: arear(datar)});
    correctSelr.append('path.liner').at({ d: liner(datar)});

    let userGraphDataSel = dragwRangeInfo.svg.append('path.your-line');
    dragwRangeInfo.drawAxis();

    let userGraphData = datar
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
      if (res.statusCode === 200 ) alert("Success");
    })
    .catch((err) => {
      alert(err);
    })
  }

  onSubmit = () => {
    console.log(this.state.debutData);
    console.log(123);
    this.saveDebutValue(this.state.debutData);
  }

  render() {
    return (
        <div className="mainWidget">
          <p>Predict the Market</p>
          <Button bsStyle='primary' onClick={this.onSubmit} className='submit-prediction'>Submit Prediction</Button>
          <Button bsStyle='primary' className='see-average'>See Average</Button>
          <div id="drag"></div>
        </div>
      );
    }
}

export default Dragchart;
