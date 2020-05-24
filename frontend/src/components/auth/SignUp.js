import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import axios from 'axios';

import serverAddress from '../../modules/server';
import statusCodes from '../../modules/status_codes';

import '../../styles/auth.css';
import '../../styles/link.css';

class SignUp extends Component {

    constructor(props) {

        super(props);

        this.state = {
            columns: ['id', 'login', 'password', 'nickname'],
            columnsAlt: ['#', 'Login', 'Password', 'Nick Name'],
            newInfo: {
                login: '',
                password: '',
                confirmedPassword: '',
                nickname: ''
            },
            signedUp: false,
            errors: []
        }

        this.PASSWORDS_DO_NOT_MATCH_MSG = 'Invalid confirmed password!';

        this.onChangeLogin = this.onChangeLogin.bind(this);
        this.onChangeNickName = this.onChangeNickName.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onChangeConfirmedPassword = this.onChangeConfirmedPassword.bind(this);

        this.onSubmit = this.onSubmit.bind(this);

    }

    onChangeLogin(e) {
        this.setState({
            newInfo : {
                ...this.state.newInfo,
                login: e.target.value
            }
        });
    }

    onChangePassword(e) {
        this.setState({
            newInfo: {
                ...this.state.newInfo,
                password: e.target.value
            }
        });
    }

    onChangeConfirmedPassword(e) {
        this.setState({
            newInfo: {
                ...this.state.newInfo,
                confirmedPassword: e.target.value
            }
        });
    }

    onChangeNickName(e) {
        this.setState({
            newInfo : {
                ...this.state.newInfo,
                nickname: e.target.value
            }
        });
    }

    onSubmit(e) {

        e.preventDefault();

        if (this.state.newInfo.password !== this.state.newInfo.confirmedPassword) {
            this.setState({
                signedUp: false,
                errors: [{ msg: this.PASSWORDS_DO_NOT_MATCH_MSG }]
            });
        }

        const obj = {
            login: this.state.newInfo.login,
            password: this.state.newInfo.password,
            nickname: this.state.newInfo.nickname,
        };

        axios.post(`${serverAddress}signup`, obj)
        .then(response => {
            this.setState({
                signedUp: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            if (err.response && (err.response.status ===
                statusCodes.INTERNAL_SERVER_ERROR ||
                err.response.status === statusCodes.BAD_REQUEST)) {
                this.setState({
                    signedUp: false,
                    errors: err.response.data.errors
                });
            }
        })

    }

    render() {

        let errorBlocks = null;
        if (this.state.signedUp) {
            return <Redirect from="/signup" to="/signin" />
        }
        else {
            errorBlocks = this.state.errors.map((error) =>
                <div key={ error.msg } className="container">
                    <div className="alert alert-danger">{ error.msg }</div>
                </div>
            );
        }

        return(

            <div className="auth-background w-100 d-flex justify-content-center">
                <div className="h-100 d-flex flex-column justify-content-center">
                    <div className="auth-container m-0 p-5">
                        <div>
                            { errorBlocks }
                        </div>
                        <form method="post" className="d-flex flex-column mb-3" onSubmit={ this.onSubmit }>
                            <div className="form-group">
                                <input type="email" name={ this.state.columns[1] } placeholder={ this.state.columnsAlt[1] } value={ this.state.newInfo.login } onChange= { this.onChangeLogin } className="form-control auth-form-control" id="exampleFormControlInput1" required />
                            </div>
                            <div className="form-group">
                                <input type="text" name={ this.state.columns[3] } placeholder={ this.state.columnsAlt[3] } value={ this.state.newInfo.nickname } onChange= { this.onChangeNickName } className="form-control auth-form-control" id="exampleFormControlInput2" required />
                            </div>
                            <div className="form-group">
                                <input type="password" name={ this.state.columns[2] } placeholder={ this.state.columnsAlt[2] } value={ this.state.newInfo.password } onChange= { this.onChangePassword } className="form-control auth-form-control" id="exampleFormControlInput3" required />
                            </div>
                            <div className="form-group">
                                <input type="password" name="confirm_password" placeholder="Confirm Password" value={ this.state.newInfo.confirmedPassword } onChange= { this.onChangeConfirmedPassword } className="form-control auth-form-control" id="exampleFormControlInput4" required />
                            </div>
                            <button type="submit" name="Sign Up" className="btn btn-dark align-self-center">Sign Up</button>
                        </form>
                        <div className="d-flex justify-content-center">
                            <div>
                                Already have an account?
                            </div>
                            <Link to="/signin" rel="noopener" className="ml-1 link">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        )
    }
}

export default SignUp;
