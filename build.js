const SRC = 'src/', DIST = 'dist/', main = 'chart.js';

const fs = require('fs');

var modules = {}, module_order = [];

function build( source, module )
{
	var requireRE = /require\(\s*["']([^"']+)["']\s*\)/gi, requireMatch;
		
	if( module && module_order.indexOf(module) == -1 )
	{
		module_order.push(module);
	}
	
	while( requireMatch = requireRE.exec(source) )
	{
		var required = requireMatch[1];
		
		if( module )
		{
			var requiredOrder = module_order.indexOf(required), moduleOrder = module_order.indexOf(module);
			
			if( requiredOrder == -1 )
			{
				module_order.splice(moduleOrder, 0, required);
			}
			else if( requiredOrder > moduleOrder )
			{
				module_order.splice(requiredOrder, 1);
				module_order.splice(moduleOrder, 0, required);
			}
		}
		else if( module_order.indexOf(required) == -1 )
		{
			module_order.push(required);
		}
		
		if( typeof modules[required] == 'undefined' )
		{
			modules[required] = build( fs.readFileSync(SRC + required, 'utf8').replace(/^module\.exports\s*=\s*/,''), required );
		}
		
		source = source.substr(0, requireRE.lastIndex - requireMatch[0].length ) + '__module__[\''+required+'\']' + source.substr(requireRE.lastIndex);
	}
	
	if( !module )
	{
		var libraryRE = /^\s*([^\s]+)\s*=\s*function\s*\(\s*\)\s*{/gm, libraryMatch;
		
		if( libraryMatch = libraryRE.exec(source) )
		{
			var compiled = 'window.' + libraryMatch[1] + ' = new( function()\n{\n\tvar __module__ = \n\t{\n';
			
			for( var i = 0; i < module_order.length; ++i )
			{
				compiled += '\t\t\'' + module_order[i] + '\': ' + modules[module_order[i]].replace(/[\r\t ]*\n/mg, '\n\t\t').trim().replace(/^{/,'\n\t\t{') + ( i < module_order.length - 1 ? ',\n\n' : '\n' );
			}
			
			compiled += '\t}\n' + source.substr(libraryRE.lastIndex).trim() + ')();';
			
			source = compiled;
		}
		else{ throw('Bad library format, "LibraryName = function()" missing'); }
	}
	
	return source.trim();
}

try
{
	var library = build(fs.readFileSync(SRC + main, 'utf8'));
	
	fs.writeFileSync(DIST + main, library, 'utf8');
	fs.writeFileSync('examples/' + main, library, 'utf8');
	
	console.log('Build "'+main+'" successful!');
	
	try
	{
		var compressor = require('node-minify');
		
		new compressor.minify(
		{
			type: 'gcc',
			fileIn: DIST + main,
			fileOut: (DIST + main).replace(/\.js$/, '.min.js'),
			callback: function(err, min){ console.log(err); }
		});
		
		console.log('Minify "'+main+'" successful!');
	}
	catch(e){ console.log('Minify "'+main+'" FAILED! Module node-minify missing.'); }
}
catch(e)
{
	console.log('Build FAILED!', e);
}