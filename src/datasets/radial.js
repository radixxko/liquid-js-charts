module.exports = function( data, on_update, options )
{
	var self = this;
	
	this.values = null;
	this.colors = null;
	this.sum = 0;
	
	this.updateData = function( data )
	{
		self.values = {};
		self.colors = self.colors ? self.colors : {};
		self.sum = 0;
		
		var i = 0;
		for( var segment in data )
		{
			self.values[segment] = data[segment];
			self.sum += data[segment];  
			
			if( typeof self.colors[segment] == 'undefined' )
			{
				self.colors[segment] = require('helpers/color.js').randomColor(i++);
			}
		}
		
		window.requestAnimationFrame( on_update );
		
		/*setTimeout(function()
		{
			var data = {};
			
			for( var segment in self.values )
			{
				data[segment] = self.values[segment] * ( 0.95 + Math.random() * 0.1 );
			}
			
			self.updateData( data );
			
		}, 60);*/
	}
	
	self.updateData( data );
}