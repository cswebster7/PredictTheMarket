import React, { Component } from "react";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Login.css";
import Amplify, { Auth } from "aws-amplify";
import DragChart from "./DragChart.js";
import Cookies from "universal-cookie";

Amplify.configure({
  Auth: {
    region: "us-west-2",
    userPoolId: "us-west-2_s2knk8nhY",
    userPoolWebClientId: "7m215sihsv1h9juaej206lempi"
  }
});

class Login extends Component {
  constructor(props) {
    super(props);
    this.cookies = new Cookies();

    this.state = {
      confirm_password: "",
      password: "",
      username: "",
      email: "",
      authCode: "",
      showAuth: false,
      showSignUp: false,
      showLogin: false,
      showMain: false,
      xfactor: null
    };
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  signIn = event => {
    event.preventDefault();

    const password = this.state.password;
    const email = this.state.email;
    Auth.signIn(email, password)
      .then(() => {
        Auth.currentSession().then(x => {

          localStorage.setItem("token", x.getIdToken().getJwtToken());
          this.cookies.set("token", x.getIdToken().getJwtToken(), {
            path: "/"
          });
        });
        this.setState({
          showLogin: false,
          showMain: true
        });
      })

      .catch(err => {
        alert(err["message"]);
      });
  };

  signUp = event => {
    event.preventDefault();
    const password = this.state.password;
    const email = this.state.email;
    const confirm_password = this.state.confirm_password;
    const username = this.state.username;
    if (password === confirm_password) {
      Auth.signUp({
        password,
        confirm_password,
        username,
        attributes: {
          email
        }
      })
        .then(() => {
          alert("successful sign up!");
          this.setState({
            showSignUp: false,
            showAuth: true
          });
        })
        .catch(err => {
          alert(err["message"]);
        });
    } else {
      alert("Passwords do not match");
    }
  };

  logOut = event => {
    Auth.signOut()
      .then(() => {
        this.setState({
          showMain: false,
          showLogin: true
        });
        localStorage.clear();
        this.cookies.remove("token", { path: "/" });
      })
      .catch(err => console.log(err));
    event.preventDefault();
  };

  confirmSignUp = event => {
    event.preventDefault();
    Auth.confirmSignUp(this.state.username, this.state.authCode)
      .then(() => {
        alert("successful confirm sign up!");
        this.setState({
          showAuth: false,
          showLogin: true
        });
      })
      .catch(err => alert("error confirming signing up: ", err));
  };

  register = event => {
    this.setState({
      showSignUp: true,
      showLogin: false
    });
    event.preventDefault();
  };

  componentDidMount() {
    if (
      localStorage.getItem("token") != null
    ) {
      this.setState({
        showMain: true,
        showLogin: false
      });
    } else {
      this.setState({
        showMain: false,
        showLogin: true
      });
    }
  }

  render() {
    return (
      <div className="Login">
        <p>Predict the Market</p>
        {this.state.showMain ? (
          <div>
            <botton
              className="btn btn-secondary"
              onClick={this.logOut.bind(this)}
            >
              Log Out
            </botton>
            <DragChart />
          </div>
        ) : null}

        {this.state.showLogin ? (
          <div>
            <form onSubmit={this.signIn}>
              <FormGroup controlId="email" bsSize="large">
                <ControlLabel>Email</ControlLabel>
                <FormControl
                  autoFocus
                  type="email"
                  // value={this.state.email}
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup controlId="password" bsSize="large">
                <ControlLabel>Password</ControlLabel>
                <FormControl
                  // value={this.state.password}
                  onChange={this.handleChange}
                  type="password"
                />
              </FormGroup>
              <Button
                block
                bsSize="large"
                // disabled={!this.validateForm()}
                type="submit"
              >
                Login
              </Button>
            </form>
            <br />
            <form onSubmit={this.register}>
              <FormGroup controlId="gotosignup" bsSize="large">
                <ControlLabel>
                  Don't have an account? Please Register!
                </ControlLabel>
                <Button block bsSize="large" type="submit">
                  Register
                </Button>
              </FormGroup>
            </form>
          </div>
        ) : null}

        {this.state.showSignUp ? (
          <div>
            <form onSubmit={this.signUp}>
              <FormGroup controlId="username" bsSize="large">
                <ControlLabel>Username</ControlLabel>
                <FormControl
                  autoFocus
                  type="text"
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup controlId="email" bsSize="large">
                <ControlLabel>Email</ControlLabel>
                <FormControl
                  autoFocus
                  type="email"
                  onChange={this.handleChange}
                />
              </FormGroup>

              <FormGroup controlId="password" bsSize="large">
                <ControlLabel>Password</ControlLabel>
                <FormControl onChange={this.handleChange} type="password" />
              </FormGroup>

              <FormGroup controlId="confirm_password" bsSize="large">
                <ControlLabel>Confirm Password</ControlLabel>
                <FormControl onChange={this.handleChange} type="password" />
              </FormGroup>

              <Button
                block
                bsSize="large"
                // disabled={this.state.confirm_password === this.state.password}
                type="submit"
              >
                Submit
              </Button>
            </form>
          </div>
        ) : null}

        {this.state.showAuth ? (
          <div>
            <form onSubmit={this.confirmSignUp}>
              <FormGroup controlId="authCode" bsSize="large">
                <ControlLabel>
                  Enter the Authentication Code you received in your E-mail
                </ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.authCode}
                  onChange={this.handleChange}
                />
              </FormGroup>

              <Button block bsSize="large" type="submit">
                SignUp
              </Button>
            </form>
          </div>
        ) : null}
      </div>
    );
  }
}
export default Login;
