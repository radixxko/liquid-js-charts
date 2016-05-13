module.exports = 
{
	randomColor: function( id )
	{
		var colors = [ 'F44336', '3F51B5', '009688', '8E24AA', 'FFEB3B' ];
		
		if( id < colors.length ){ return '#' + colors[id]; }
		
		var color = '#';
		for( var i = 0; i < 6; ++i )
		{
			color += '0123456789ABCDEF'.charAt(Math.floor(Math.random()*16));
		}
		
		return color;
	}
}