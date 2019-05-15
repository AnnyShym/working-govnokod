import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

class ChangeActor extends Component {

    constructor(props) {

        super(props);

        this.state = {
            table: 'actors',
            route: 'http://localhost:8080/',
            columns: ['id', 'name', 'middle_name', 'last_name', 'citizenship'],
            columnsAlt: ['#', 'Name', 'Middle Name', 'Last Name', 'Citizenship'],
            countries: [],
            actor: {
                name: '',
                middle_name: '',
                last_name: '',
                citizenship: 'NULL'
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

        this.onChangeName= this.onChangeName.bind(this);
        this.onChangeMiddleName = this.onChangeMiddleName.bind(this);
        this.onChangeLastName = this.onChangeLastName.bind(this);
        this.onChangeCitizenship = this.onChangeCitizenship.bind(this);

        this.onSubmit = this.onSubmit.bind(this);

    }

    componentDidMount() {

        this.getCountries();

        if (this.props.match.params.operation === this.opUpdate) {
            this.getActorInfo();
        }

    }

    getCountries() {
        axios.get(`${this.state.route}${this.state.table}/countries`,
            {withCredentials: true})
        .then(response => {
            this.setState({
                countries: response.data.countries,
                authorized: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.status ===
                this.statusCodes.UNAUTHORIZED) {
                this.setState({
                    countries: [],
                    authorized: false,
                    errors: err.response.data.errors
                });
            }
        })
    }

    getActorInfo() {
        axios.get(`${this.state.route}${this.state.table}/${
            this.props.match.params.id}`, {withCredentials: true})
        .then(response => {
            this.setState({
                actor: response.data.row[0],
                authorized: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.status ===
                this.statusCodes.UNAUTHORIZED) {
                this.setState({
                    actor: {
                        name: '',
                        middle_name: '',
                        last_name: '',
                        citizenship: 'NULL'
                    },
                    authorized: false,
                    errors: err.response.data.errors
                });
            }
            if (err.response && (err.response.status ===
                this.statusCodes.INTERNAL_SERVER_ERROR ||
                err.response.status === this.statusCodes.BAD_REQUEST)) {
                this.setState({
                    actor: {
                        name: '',
                        middle_name: '',
                        last_name: '',
                        citizenship: 'NULL'
                    },
                    errors: err.response.data.errors
                });
            }
        })
    }

    onChangeName(e) {
        this.setState({
            actor : {
                ...this.state.actor,
                name: e.target.value
            }
        });
    }

    onChangeMiddleName(e) {
        this.setState({
            actor: {
                ...this.state.actor,
                middle_name: e.target.value
            }
        });
    }

    onChangeLastName(e) {
        this.setState({
            actor: {
                ...this.state.actor,
                last_name: e.target.value
            }
        });
    }

    onChangeCitizenship(e) {
        this.setState({
            actor: {
                ...this.state.actor,
                citizenship: e.target[e.target.selectedIndex].value
            }
        });
    }


    onSubmit(e) {

        e.preventDefault();

        const obj = {
            name: this.state.actor.name,
            middle_name: this.state.actor.middle_name,
            last_name: this.state.actor.last_name,
            citizenship: this.state.actor.citizenship,
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

        const countryOptions = this.state.countries.map((country) =>
            <option key={ country } value={ country }>{ country }</option>
        );

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
                            <input type="text" name={ this.state.columns[1] } value={ this.state.actor.name } onChange= { this.onChangeName } className="form-control" id="exampleFormControlInput1" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleFormControlInput2">{ this.state.columnsAlt[2] }:</label>
                            <input type="text" name={ this.state.columns[2] } value={ this.state.actor.middle_name } onChange= { this.onChangeMiddleName } className="form-control" id="exampleFormControlInput2" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleFormControlInput3">{ this.state.columnsAlt[3] }:</label>
                            <input type="text" name={ this.state.columns[3] } value={ this.state.actor.last_name } onChange= { this.onChangeLastName } className="form-control" id="exampleFormControlInput3" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleFormControlInput4">{ this.state.columnsAlt[4] }:</label>
                            <select name={ this.state.columns[4] } value={ this.state.actor.citizenship } onChange= { this.onChangeCitizenship } className="form-control" id="exampleFormControlSelect1">
                                { countryOptions }
                            </select>
                        </div>
                        <button type="submit" name={ operationAlt } className="btn btn-success" align="center">{ operationAlt }</button>
                    </form>
                </div>
            </div>

        )
    }
}

export default ChangeActor;
