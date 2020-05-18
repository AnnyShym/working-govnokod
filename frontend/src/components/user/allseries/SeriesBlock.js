import React, { Component } from 'react';

import SeriesCard from './SeriesCard';

import '../../../styles/series_info.css';

class SeriesBlock extends Component {
    render() {

        const seriesBlocks = this.props.series.map((series) =>
            <SeriesCard key={ series.series_id } series={ series } />
        );

        return(

            <div className="container series-block">
                { seriesBlocks}
            </div>

        );
    }
}

export default SeriesBlock;
