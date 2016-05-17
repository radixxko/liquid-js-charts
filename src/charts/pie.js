module.exports = function( canvas, data, options )
{	
	var pixelRatio = window.devicePixelRatio, 
		context = canvas.getContext('2d'), 
		chart = { event: { hover: null } };
	
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
		
		for( var segment in chart.dataset.values )
		{
			var startAngle = (( 360 * fraction - 90) * Math.PI ) / 180,
				endAngle = startAngle + 2 * chart.dataset.values[segment] / chart.dataset.sum * Math.PI,
				
				outerSpacing = pixelRatio * ( options.segmentSpacing != 0 ? options.segmentSpacing : -0.5 ) / ( 2 * chart.radius );
				innerSpacing = pixelRatio * ( options.segmentSpacing != 0 ? options.segmentSpacing : -0.5 ) / ( 2 * chart.innerRadius );
				
		    context.beginPath();
		    {
			    if( chart.innerRadius != 0 )
			    {
				    context.arc(chart.center.x, chart.center.y, chart.innerRadius, endAngle - innerSpacing, startAngle + innerSpacing, true);
				}
				else{ context.moveTo(chart.center.x, chart.center.y); } // Todo: posunut stred 0.5px v proti smere segmentu nech nevidno biele medzery medzi segmentami
			    
			    context.arc(chart.center.x, chart.center.y, chart.radius, startAngle + outerSpacing, endAngle - outerSpacing, false);
		    }
		    context.closePath();
		    
			context.fillStyle = chart.dataset.colors[segment];
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
			    context.fillStyle = 'rgba(0,0,0,0.1)';
				context.fill();
			}
			
			if( options['3d'] ) // 3D
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
			    var gradient = context.createRadialGradient(chart.center.x, chart.center.y, chart.innerRadius, chart.center.x, chart.center.y, chart.radius);
			    if( chart.innerRadius != 0 )
			    {
					gradient.addColorStop(0,'rgba(0,0,0,'+(0.1+(1-options.innerRadiusRatio)/10)+')');
					gradient.addColorStop(0.5,'rgba(255,255,255,'+(0.1+(1-options.innerRadiusRatio)/10)+')');
				}
				else
				{
					gradient.addColorStop(0,'rgba(255,255,255,'+(0.1+(1-options.innerRadiusRatio)/10)+')');
				}
				gradient.addColorStop(1,'rgba(0,0,0,'+(0.1+(1-options.innerRadiusRatio)/10)+')');
				context.fillStyle=gradient;
				context.fill();
			}
			
			var font_size = chart.radius / 15;
			
			context.font = font_size + 'px Arial, Helvetica';
			context.textAlign = 'center';
			context.fillStyle = 'white';
			
			var label = Math.round(chart.dataset.values[segment] / chart.dataset.sum * 1000)/10+'%';
			
			if( context.measureText(label).width < chart.radius - chart.innerRadius )
			{
				context.fillText(label, chart.center.x + Math.cos( ( 2 * fraction + chart.dataset.values[segment] / chart.dataset.sum - 0.5 ) * Math.PI ) * (chart.radius + chart.innerRadius) / 2, chart.center.y + font_size / 3 + Math.sin( ( 2 * fraction + chart.dataset.values[segment] / chart.dataset.sum - 0.5 ) * Math.PI ) * (chart.radius + chart.innerRadius) / 2);
			}
			    
			fraction += chart.dataset.values[segment] / chart.dataset.sum;
		}
		
		var font_size = chart.radius / 10;
		
		context.font = font_size + 'px Arial, Helvetica';
		context.textAlign = 'center';
		context.fillStyle = 'black';
		context.fillText( chart.event.hover ? chart.event.hover : 'Graf' , chart.center.x, chart.center.y);
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
				
				for( var segment in chart.dataset.values )
				{
					if( event_fraction <= ( fraction += chart.dataset.values[segment] ) / chart.dataset.sum )
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
		else if( event == 'mouseout' )
		{
			if( chart.event.hover )
			{
				chart.event.hover = null;
				render();
			}
		}
		else if( event == 'resize' )
		{
			render();
		}
	}
	
	this.updateData = function( data )
	{
		chart.dataset.updateData( data );
	}
	
	chart.dataset = new require('datasets/radial.js')( data, render );
}