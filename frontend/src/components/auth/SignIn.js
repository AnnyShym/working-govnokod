import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import axios from 'axios';

import serverAddress from '../../modules/server';
import roles from '../../modules/roles';
import statusCodes from '../../modules/status_codes';

import '../../styles/auth.css';
import '../../styles/link.css';

class SignIn extends Component {

    constructor(props) {

        super(props);

        this.state = {
            columns: ['id', 'login', 'password'],
            columnsAlt: ['#', 'Login', 'Password'],
            authInfo: {
                login: '',
                password: ''
            },
            signedIn: false,
            role: roles.USER,
            errors: []
        }

        this.onChangeLogin = this.onChangeLogin.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onChangeRole = this.onChangeRole.bind(this);

        this.onSubmit = this.onSubmit.bind(this);

    }

    onChangeLogin(e) {
        this.setState({
            authInfo : {
                ...this.state.authInfo,
                login: e.target.value
            }
        });
    }

    onChangePassword(e) {
        this.setState({
            authInfo: {
                ...this.state.authInfo,
                password: e.target.value
            }
        });
    }

    onChangeRole(e) {
        this.setState({
            role: e.target[e.target.selectedIndex].value
        });
    }


    onSubmit(e) {

        e.preventDefault();

        const obj = {
            login: this.state.authInfo.login,
            password: this.state.authInfo.password,
            role: this.state.role
        };

        axios.post(`${serverAddress}signin`, obj, {withCredentials: true})
        .then(response => {
            this.setState({
                signedIn: true,
                errors: []
            });
        })
        .catch(err => {
            console.log(err);
            if (err.response && (err.response.status ===
                statusCodes.INTERNAL_SERVER_ERROR ||
                err.response.status === statusCodes.BAD_REQUEST)) {
                this.setState({
                    signedIn: false,
                    errors: err.response.data.errors
                });
            }
        })

    }

    render() {

        let errorBlocks = null;
        if (this.state.signedIn) {
            if (this.state.role === roles.ADMIN) {
                return <Redirect from="/signin" to="/tables" />
            }
            else {
                return <Redirect from="/signin" to="/series" />
            }
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
                        <form className="d-flex flex-column" method="post" onSubmit={ this.onSubmit }>
                            <div className="form-group">
                                <input type="email" name={ this.state.columns[1] } placeholder={ this.state.columnsAlt[1] } value={ this.state.authInfo.login } onChange= { this.onChangeLogin } className="form-control" id="exampleFormControlInput1" required />
                            </div>
                            <div className="form-group">
                                <input type="password" name={ this.state.columns[2] } placeholder={ this.state.columnsAlt[2] } value={ this.state.authInfo.password } onChange= { this.onChangePassword } className="form-control" id="exampleFormControlInput2" required />
                            </div>
                            <div className="form-group">
                                <select name="role" value={ this.state.role } onChange= { this.onChangeRole } className="form-control" id="exampleFormControlSelect1">
                                    <option value={ roles.USER }>{ roles.USER }</option>
                                    <option value={ roles.ADMIN }>{ roles.ADMIN }</option>
                                </select>
                            </div>
                            <button type="submit" name="Sign In" className="btn btn-dark align-self-center">Sign In</button>
                        </form>
                        <div>
                            <p>You don't have an account? <Link to="/signup" rel="noopener" className="link">Sign Up</Link></p>
                        </div>
                    </div>
                </div>
            </div>

        )
    }
}

export default SignIn;
