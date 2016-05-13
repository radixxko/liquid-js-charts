module.exports = function( data )
{
	var self = this;
	
	this.values = {};
	this.sum = 0;
	
	this.updateData = function( data )
	{
		self.values = {};
		self.sum = 0;
		
		for( var segment in data )
		{
			self.values[segment] = data[segment];
			self.sum += data[segment];  
		}
	}
	
	self.updateData( data );
}