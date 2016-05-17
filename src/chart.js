Chart = function()
{
	var pixelRatio = window.devicePixelRatio;
	
	var charts = [];
	
	var chart_types = 
	{
		pie: require('charts/pie.js')
	}
	
	function viewportPosition( element )
	{
		var bounds = element.getBoundingClientRect();
		
		return { x : bounds.left, y : bounds.top };
	}
		
	window[window.attachEvent ? 'attachEvent' : 'addEventListener'](window.attachEvent ? 'onresize' : 'resize', function()
    {
		for( var i = charts.length - 1; i >= 0; --i )
		{
			if( document.contains(charts[i].element) && document.contains(charts[i].canvas) )
			{
				if( charts[i].width != charts[i].element.offsetWidth || charts[i].height != charts[i].element.offsetHeight )
				{
					charts[i].canvas.setAttribute('width', charts[i].element.offsetWidth * pixelRatio);
					charts[i].canvas.setAttribute('height', charts[i].element.offsetHeight * pixelRatio);
					charts[i].canvas.setAttribute('style','position:absolute;top:0;left:0;width:'+charts[i].element.offsetWidth+'px;height:'+charts[i].element.offsetHeight+'px');
					
					charts[i].chart.event('resize');
				}
			}
			else{ charts.splice(i, 1); }
		}    
    });
	
	this.create = function( chart, element, data, options )
	{
		if( typeof element == 'string' ){ element = document.getElementById(element); }
		
		if( element && typeof chart_types[chart] != undefined )
		{
			var canvas = document.createElement('canvas');
			var context = canvas.getContext('2d');
			
			context.mozImageSmoothingEnabled = true;
			context.webkitImageSmoothingEnabled = true;
			context.msImageSmoothingEnabled = true;
			context.imageSmoothingEnabled = true;
			
			canvas.setAttribute('width', element.offsetWidth * pixelRatio);
			canvas.setAttribute('height', element.offsetHeight * pixelRatio);
			canvas.setAttribute('style','position:absolute;top:0;left:0;width:'+element.offsetWidth+'px;height:'+element.offsetHeight+'px');
			
			element.innerHTML = '';
			element.appendChild(canvas);
			
			chart = new chart_types[chart]( canvas, data, options );
			
			canvas.addEventListener('mousemove', function(event)
			{
				var position = viewportPosition( element );
				
				chart.event('mousemove', { x: ( event.pageX - position.x ) * pixelRatio, y: ( event.pageY - position.y ) * pixelRatio });
			});
			
			canvas.addEventListener('mouseout', function(event){ chart.event('mouseout'); });
			
			charts.push({ chart: chart, element: element, canvas: canvas, width: element.offsetWidth, height: element.offsetHeight });
			
			return chart;
		}
		
		return null;
	}
}