import React, { Component } from 'react';

import SeriesCard from './SeriesCard';

import '../../../styles/series_info.css';

class SeriesBlock extends Component {
    render() {

        const seriesBlocks = this.props.series.map((series) =>
            <SeriesCard key={ series.series_id } series={ series } />
        );

        return(

            <div className="container all-series-container">
                <div className="container series-block">
                    { seriesBlocks}
                </div>
            </div>

        );
    }
}

export default SeriesBlock;
