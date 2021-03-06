var React = require('react')

module.exports = {
    Image: React.createClass({
        propTypes: {
            url: React.PropTypes.string.isRequired
        },

        render: function () {
            return (
                <div id='success-image'>
                    <img src={this.props.url} className="monitor-success-image" alt="" /></div>
            )
        },

        shouldComponentUpdate: function () {
            return false
        }
    })
}
