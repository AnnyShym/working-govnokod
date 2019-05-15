import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

class ChangeUser extends Component {

    constructor(props) {

        super(props);

        this.state = {
            table: 'users',
            route: 'http://localhost:8080/',
            columns: ['id', 'login', 'password'],
            columnsAlt: ['#', 'Login', 'Password'],
            user: {
                login: '',
                password: ''
            },
            authorized: true,
            changed: false,
            errors: []
        }

        this.statusCodes = {
            BAD_REQUEST: 400,
            UNAUTHORIZED: 401,
            INTERNAL_SERVER_ERROR: 500
        };

        this.opInsert = 'insert';
        this.opUpdate = 'update';

        this.onChangeLogin = this.onChangeLogin.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);

        this.onSubmit = this.onSubmit.bind(this);

    }

    componentDidMount() {
        if (this.props.match.params.operation === this.opUpdate) {
            this.getUserInfo();
        }
    }

    getUserInfo() {
        axios.get(`${this.state.route}${this.state.table}/${
            this.props.match.params.id}`, {withCredentials: true})
        .then(response => {
            this.setState({
                user: {
                    login: response.data.row[0].login,
                    password: ''
                },
                authorized: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.status ===
                this.statusCodes.UNAUTHORIZED) {
                this.setState({
                    user: {
                        login: '',
                        password: ''
                    },
                    authorized: false,
                    errors: err.response.data.errors
                });
            }
            if (err.response && (err.response.status ===
                this.statusCodes.INTERNAL_SERVER_ERROR ||
                err.response.status === this.statusCodes.BAD_REQUEST)) {
                this.setState({
                    user: {
                        login: '',
                        password: ''
                    },
                    errors: err.response.data.errors
                });
            }
        })
    }

    onChangeLogin(e) {
        this.setState({
            user : {
                ...this.state.user,
                login: e.target.value
            }
        });
    }

    onChangePassword(e) {
        this.setState({
            user: {
                ...this.state.user,
                password: e.target.value
            }
        });
    }

    onSubmit(e) {

        e.preventDefault();

        const obj = {
            login: this.state.user.login,
            password: this.state.user.password
        };

        let route = null;
        if (this.props.match.params.operation === this.opInsert) {
            route = `${this.state.route}${this.state.table}/${
                this.props.match.params.operation}`
        }
        else {
            route = `${this.state.route}${this.state.table}/${
                this.props.match.params.operation}/${this.props.match.params.id}`;
        }

        axios.post(route, obj, {withCredentials: true})
        .then(response => {
            this.setState({
                authorized: true,
                changed: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.status ===
                this.statusCodes.UNAUTHORIZED) {
                this.setState({
                    authorized: false,
                    changed: false,
                    errors: err.response.data.errors
                });
            }
            if (err.response && (err.response.status ===
                this.statusCodes.INTERNAL_SERVER_ERROR ||
                err.response.status === this.statusCodes.BAD_REQUEST)) {
                this.setState({
                    changed: false,
                    errors: err.response.data.errors
                });
            }
        })

    }

    render() {

        if (this.props.match.params.operation !== this.opInsert &&
            this.props.match.params.operation !== this.opUpdate) {
            return <div></div>
        }

        let errorBlocks = null;
        if (!this.state.authorized) {
            return <Redirect from={ `/${this.state.table}/${
                this.props.match.params.operation}/${
                this.props.match.params.id}` } to='/signin' />
        }
        else {
            if (this.state.changed) {
                return <Redirect from={ `/${this.state.table}/${
                    this.props.match.params.operation}/${
                    this.props.match.params.id}` } to={ `/${this.state.table}` } />
            }
            else {
                errorBlocks = this.state.errors.map((error) =>
                    <div key={ error.msg } className="container">
                        <div className="alert alert-danger">{ error.msg }</div>
                    </div>
                );
            }
        }

        const operationAlt = this.props.match.params.operation[0].toUpperCase() +
            this.props.match.params.operation.slice(1);

        return(

            <div>
                <div>
                    { errorBlocks }
                </div>
                <div className="container">
                    <form method="post" onSubmit={ this.onSubmit } align="center">
                        <div className="form-group">
                            <label htmlFor="exampleFormControlInput1">{ this.state.columnsAlt[1] }:</label>
                            <input type="text" name={ this.state.columns[1] } value={ this.state.user.login } onChange= { this.onChangeLogin } className="form-control" id="exampleFormControlInput1" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleFormControlInput2">{ this.state.columnsAlt[2] }:</label>
                            <input type="password" name={ this.state.columns[2] } value={ this.state.user.password } onChange= { this.onChangePassword } className="form-control" id="exampleFormControlInput2" required />
                        </div>
                        <button type="submit" name={ operationAlt } className="btn btn-success" align="center">{ operationAlt }</button>
                    </form>
                </div>
            </div>

        )
    }
}

export default ChangeUser;
