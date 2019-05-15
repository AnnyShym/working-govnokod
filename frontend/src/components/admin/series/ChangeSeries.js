import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

class ChangeSeries extends Component {

    constructor(props) {

        super(props);

        this.state = {
            table: 'series',
            route: 'http://localhost:8080/',
            columns: ['id', 'title', 'country', 'description', 'rating'],
            columnsAlt: ['#', 'Title', 'Country', 'Description', 'Rating'],
            countries: [],
            ratingOptions: ['NULL', '1', '2', '3', '4', '5'],
            series: {
                title: '',
                country: 'NULL',
                description: '',
                rating: 'NULL'
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

        this.onChangeTitle = this.onChangeTitle.bind(this);
        this.onChangeCountry = this.onChangeCountry.bind(this);
        this.onChangeDescription = this.onChangeDescription.bind(this);
        this.onChangeRating = this.onChangeRating.bind(this);

        this.onSubmit = this.onSubmit.bind(this);

    }

    componentDidMount() {

        this.getCountries();

        if (this.props.match.params.operation === this.opUpdate) {
            this.getSeriesInfo();
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

    getSeriesInfo() {
        axios.get(`${this.state.route}${this.state.table}/${
            this.props.match.params.id}`, {withCredentials: true})
        .then(response => {
            this.setState({
                series: response.data.row[0],
                authorized: true,
                errors: []
            });
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.status ===
                this.statusCodes.UNAUTHORIZED) {
                this.setState({
                    series: {
                        title: '',
                        country: 'NULL',
                        description: '',
                        rating: 'NULL'
                    },
                    authorized: false,
                    errors: err.response.data.errors
                });
            }
            if (err.response && (err.response.status ===
                this.statusCodes.INTERNAL_SERVER_ERROR ||
                err.response.status === this.statusCodes.BAD_REQUEST)) {
                this.setState({
                    series: {
                        title: '',
                        country: 'NULL',
                        description: '',
                        rating: 'NULL'
                    },
                    errors: err.response.data.errors
                });
            }
        })
    }

    onChangeTitle(e) {
        this.setState({
            series : {
                ...this.state.series,
                title: e.target.value
            }
        });
    }

    onChangeCountry(e) {
        this.setState({
            series: {
                ...this.state.series,
                country: e.target[e.target.selectedIndex].value
            }
        });
    }

    onChangeDescription(e) {
        this.setState({
            series: {
                ...this.state.series,
                description: e.target.value
            }
        });
    }

    onChangeRating(e) {
        this.setState({
            series: {
                ...this.state.series,
                rating: e.target[e.target.selectedIndex].value
            }
        });
    }


    onSubmit(e) {

        e.preventDefault();

        const obj = {
            title: this.state.series.title,
            country: this.state.series.country,
            description: this.state.series.description,
            rating: this.state.series.rating,
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

        const ratingOptions = this.state.ratingOptions.map((rating) =>
            <option key={ rating } value={ rating }>{ rating }</option>
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
                            <input type="text" name={ this.state.columns[1] } value={ this.state.series.title } onChange= { this.onChangeTitle } className="form-control" id="exampleFormControlInput1" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleFormControlInput2">{ this.state.columnsAlt[2] }:</label>
                            <select name={ this.state.columns[2] } value={ this.state.series.country} onChange= { this.onChangeCountry } className="form-control" id="exampleFormControlSelect1">
                                { countryOptions }
                            </select>
                        </div>
                        <div className="form-group">
                  	        <label htmlFor="exampleFormControlTextarea1">{ this.state.columnsAlt[3] }:</label>
                  	        <textarea name={ this.state.columns[3] } value={ this.state.series.description } onChange= { this.onChangeDescription } className="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
              	        </div>
                        <div className="form-group">
                            <label htmlFor="exampleFormControlInput3">{ this.state.columnsAlt[4] }:</label>
                            <select name={ this.state.columns[4] } value={ this.state.series.rating} onChange= { this.onChangeRating } className="form-control" id="exampleFormControlSelect2">
                                { ratingOptions }
                            </select>
                        </div>
                        <button type="submit" name={ operationAlt } className="btn btn-success" align="center">{ operationAlt }</button>
                    </form>
                </div>
            </div>

        )
    }
}

export default ChangeSeries;
