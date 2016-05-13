module.exports = function( canvas, data, options )
{
	function randomColor( id )
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
	
	var pixelRatio = window.devicePixelRatio, 
		context = canvas.getContext('2d'), 
		chart = { data: data, event: { hover: null } };
	
	var defaults = 
	{
		innerRadiusRatio: 2 / 3,
		segmentSpacing: 2
	};
	
	function render()
	{
		chart.width = canvas.width;
		chart.height = canvas.height;
		chart.center = { x: chart.width / 2, y: chart.height / 2 };
		chart.radius = Math.min( chart.width, chart.height ) / 2;
		chart.innerRadius = options.innerRadiusRatio * chart.radius;
		
		context.clearRect(0, 0, chart.width, chart.height);
		
		var fraction = 0;
		
		for( var segment in chart.data.values )
		{
			console.log(segment);
			
			var startAngle = (( 360 * fraction - 90) * Math.PI ) / 180,
				endAngle = startAngle + 2 * chart.data.values[segment] / chart.data.sum * Math.PI,
				
				outerSpacing = pixelRatio * options.segmentSpacing / ( 2 * chart.radius );
				innerSpacing = pixelRatio * options.segmentSpacing / ( 2 * chart.innerRadius );
				
		    context.beginPath();
		    {
			    if( chart.innerRadius != 0 )
			    {
				    context.arc(chart.center.x, chart.center.y, chart.innerRadius, endAngle - innerSpacing, startAngle + innerSpacing, true);
				}
				else{ context.moveTo(chart.center.x, chart.center.y); }
			    
			    context.arc(chart.center.x, chart.center.y, chart.radius, startAngle + outerSpacing, endAngle - outerSpacing, false);
		    }
		    context.closePath();
		    context.fillStyle = randomColor(10);
			context.fill();
			
			if( chart.event.hover == segment )
			{
				context.beginPath();
			    {
				    if( chart.innerRadius != 0 )
				    {
					    context.arc(chart.center.x, chart.center.y, chart.innerRadius, endAngle - innerSpacing, startAngle + innerSpacing, true);
					}
					else{ context.moveTo(chart.center.x, chart.center.y); }
				    
				    context.arc(chart.center.x, chart.center.y, chart.radius, startAngle + outerSpacing, endAngle - outerSpacing, false);
			    }
			    context.closePath();
			    context.fillStyle = 'rgba(255,255,255,0.2)';
				context.fill();
			}
			
			var font_size = chart.radius / 15;
			
			context.font = font_size + 'px Arial, Helvetica';
			context.textAlign = 'center';
			context.fillStyle = 'white';
			
			var label = Math.round(chart.data.values[segment] / chart.data.sum * 1000)/10+'%';
			
			if( context.measureText(label).width < chart.radius - chart.innerRadius )
			{
				context.fillText(label, chart.center.x + Math.cos( ( 2 * fraction + chart.data.values[segment] / chart.data.sum - 0.5 ) * Math.PI ) * (chart.radius + chart.innerRadius) / 2, chart.center.y + font_size / 3 + Math.sin( ( 2 * fraction + chart.data.values[segment] / chart.data.sum - 0.5 ) * Math.PI ) * (chart.radius + chart.innerRadius) / 2);
			}
			
			context.textAlign = 'center';
			context.fillStyle = 'black';
			context.fillText( chart.event.hover == segment ? segment : 'Graf' , chart.center.x, chart.center.y);
			    
			fraction += chart.data.values[segment] / chart.data.sum;
		}
	}
			
	this.event =  function( event, position )
	{
		if( event == 'mousemove' )
		{
			var hover = null,
				distanceFromCenter = Math.sqrt(Math.pow(position.x - chart.center.x,2) + Math.pow(position.y - chart.center.y,2));
			
			if( distanceFromCenter < chart.radius && distanceFromCenter > chart.innerRadius )
			{
				var event_fraction = 1 - (Math.atan2(position.x - chart.center.x, position.y - chart.center.y) * (180 / Math.PI) - 180 + 720) % 360 / 360,
					fraction = 0;
				
				for( var segment in chart.data.values )
				{
					if( event_fraction <= ( fraction += chart.data.values[segment] ) / chart.data.sum )
					{
						hover = segment; break;
					}
				}
			}
			
			if( chart.event.hover != hover )
			{
				chart.event.hover = hover;
				render();
			}
		}
	}
	
	this.updateData = function( data )
	{
		chart.data = data;
		render();
	}
	
	render();
}