/*
 * Config
 */
force_result_limit = 100;
initial_query = "SELECT ?s ?p ?o WHERE { ?s ?p ?o }";
title_prefix = "Deniz, an easy RDF browser";
default_endpoints = ["http://dbpedia.org/sparql",
                        "http://qcrumb.com/sparql",
                        "http://data.semanticweb.org/sparql",
                        "http://uriburner.com/sparql/",
                        "http://semantic.ckan.net/sparql/"],
sparql_endpoint = default_endpoints[0];
cookie_expiration = 30; // Cookie expiration date in days

/*
 * Helper
 */

jQuery.uuid4 = function () {
    bytes = []
    for (var i=0; i<16; i++) bytes.push(Math.floor(Math.random()*0x100).toString(16));
    return bytes.slice(0, 4).join('') + '-' + bytes.slice(4, 6).join('') + '-' + bytes.slice(6, 8).join('') + '-' + bytes.slice(8, 10).join('') + '-' + bytes.slice(10, 16).join('');
};

function render_term(term) {
    if (!term) {
        value = '';
    } else if (term.type == 'uri') {
        value = '<a href="#&lt;' + term.value + '&gt;">&lt;' + term.value + '&gt;</a>';
    } else if (term.type == 'typed-literal') {
        value = '"' + term.value + '"^^&lt;' + term.datatype + '&gt;';
    } else {
        value = '"' + term.value + '"';
    }
    return value;
}

/*
 * Offer SPARQL query console
 */
// Limit results and provide "more..." button
var limit_regex = /(LIMIT\s+)(\d+)([^\{\}<>]*)$/i;
var offset_regex = /(OFFSET\s+)(\d+)([^\{\}<>]*)$/i;

function load_table(data, user_query, query_str, insert_into) {
    // Mark-up header
    var header_ths = [];
    $.each(data.head.vars, function(i, element) {
        header_ths.push('<th>' + element + '</th>');
    });
    head = header_ths.join('');
    // Mark-up rows
    var data_trs = [];
    $.each(data.results.bindings, function(i, row) {
        var tds = [];
        $.each(data.head.vars, function(i, element) {
            tds.push('<td>' + render_term(row[element]) + '</td>');
        });
        data_trs.push('<tr>' + tds.join('') + '</tr>');
    });
    rows = data_trs.join('');

    if (!insert_into) {
        id = $.uuid4();
        $('#query_results .result_container').html('<div id="' + id + '"><table class="resulttable"><thead><tr>' + head + '</tr></thead><tbody class="results"></tbody></table></div>');
        if (rows.length > 0) {
            $('#' + id + ' tbody').append(rows);
        } else {
            $('#' + id + ' tbody').append('<tr><td colspan="3"><em>None</em></td></tr>');
        }
    } else {
        id = insert_into;
        $('#' + id + ' tbody').append(rows);
        $('#' + id + ' .morebtn').remove();
    }
    // Check if there are more results
    if (user_query != query_str && data.results.bindings.length >= force_result_limit) {
        // User has not provided a limit and we got full results for our own limit
        // Encode and create link
        $('#' + id).append('<a href="#" class="morebtn">More...</a>');
        $('#' + id + ' .morebtn').button();
        $('#' + id + ' .morebtn').click(function () {
            query_str = limit_query(query_str, force_result_limit);
            requery(user_query, query_str, id);
            return false;
        });
    }
}

function limit_query(query, offset) {
    // Check if user has given a limit...
    limit_match = query.match(limit_regex);
    if (!limit_match) {
        query = query + ' LIMIT ' + force_result_limit;
    } else if (parseInt(limit_match[2]) > force_result_limit) {
        query = query.replace(limit_regex, "$1" + force_result_limit + "$3");
        final_offset = force_result_limit;
    }
    if (offset) {
        // ... and an offset
        offset_match = query.match(offset_regex);
        if (!offset_match) {
            query = query + ' OFFSET ' + offset;
        } else {
            offset_value = parseInt(offset_match[2]) + offset
            query = query.replace(offset_regex, "$1" + offset_value + "$3");
        }
    }
    return query;
}

function do_query(user_query, query_str) {
    document.title = title_prefix + ': ' + user_query;
    $('.spo_results').hide();
    $('.result_container').empty();
    $('.query_results').show();
    if (user_query) {
        if (!query_str) {
            query_str = limit_query(user_query)
        }
        $('#query_results .result_container').html($('<span>').addClass('loading'));
        $.ajax({
            type : 'GET',
            dataType : 'json',
            url : sparql_endpoint,
            data: $.param({'query' : query_str}),
            //error: function(req, st, err) { console.log(err); },
            success: function(data, textStatus, xhr) {
                load_table(data, user_query, query_str);
            }
        });
    }
}

function requery(user_query, query_str, id) {
    $.ajax({
        type : 'GET',
        dataType : 'json',
        url : sparql_endpoint,
        data: $.param({'query' : query_str}),
        //error: function(req, st, err) { console.log(err); },
        success: function(data, textStatus, xhr) {
            load_table(data, user_query, query_str, id);
        }
    });
}

/*
 * Browse subject, predicate, object for IRIs
 */
function load_spo(data, query_str, id) {
    // Mark-up rows
    var data_trs = [];
    $.each(data.results.bindings, function(i, row) {
        var tds = [];
        $.each(['s', 'p', 'o'], function(i, element) {
            tds.push('<td>' + render_term(row[element]) + '</td>');
        });
        data_trs.push('<tr>' + tds.join('') + '</tr>');
    });
    rows = data_trs.join('');

    if ($('#' + id + ' tbody').length == 0) {
        $('#' + id + ' .result_container').html('<table class="resulttable"><thead><tr><th>?s</th><th>?p</th><th>?o</th></tr></thead><tbody class="results"></tbody></table>');
    }
    if (rows.length > 0) {
        $('#' + id + ' tbody').append(rows);
    } else {
        $('#' + id + ' tbody').append('<tr><td colspan="3"><em>None</em></td></tr>');
    }
    $('#' + id + ' .morebtn').remove();
    // Check if there are more results
    if (data.results.bindings.length >= force_result_limit) {
        // Encode and create link
        $('#' + id).append('<a href="#" class="morebtn">More...</a>');
        $('#' + id + ' .morebtn').button();
        $('#' + id + ' .morebtn').click(function () {
            query_str = limit_query(query_str, force_result_limit);
            fill_spo(query_str, id);
            return false;
        });
    }
}

function fill_spo(query_str, id) {
    $.ajax({
        type : 'GET',
        dataType : 'json',
        url : sparql_endpoint,
        data: $.param({'query' : query_str}),
        //error: function(req, st, err) { console.log(err); },
        success: function(data, textStatus, xhr) {
            load_spo(data, query_str, id);
        }
    });
}

function do_spo(iri) {
    document.title = title_prefix + ': ' + iri;
    $('.query_results').hide();
    $('.result_container').empty();
    $('.spo_results').show();
    $('.spo_results .result_container').html($('<span>').addClass('loading'));
    $.each({'subject_results': 'SELECT ?p ?o WHERE { ' + iri + ' ?p ?o} LIMIT ' + force_result_limit,
            'predicate_results': 'SELECT ?s ?o WHERE {?s ' + iri + ' ?o} LIMIT ' + force_result_limit,
            'object_results': 'SELECT ?s ?p WHERE {?s ?p ' + iri + '} LIMIT ' + force_result_limit},
            function(id, query_str) {
                fill_spo(query_str, id);
            });
}

/* Page load triggered by forward/backward user action or linking to a hashed page */
function load_page() {
    var hash = window.location.hash.substr(1);
    if (hash == '') {
        $('.spo_results').hide();
        $('.result_container').empty();
        $('.query_results').hide();
        $('#browsingmenu').show();

        load_browsingmenu();
        document.title = title_prefix;
    } else {
        $('#browsingmenu').hide();
        if (/^</.test(hash)) {
            do_spo(hash);
        } else {
            do_query(hash);
        }
    }
}

function load_browsingmenu() {
    // Query named graphs
    $('#browsebygraphs .result_container').html($('<span>').addClass('loading'));
    $.ajax({
        type : 'GET',
        dataType : 'json',
        url : sparql_endpoint,
        data: $.param({'query' : "SELECT DISTINCT ?g WHERE { GRAPH ?g { ?s ?p ?o } } LIMIT 5"}),
        //error: function(req, st, err) { console.log(err); },
        success: function(data, textStatus, xhr) {
            lis = ['<li><em><a href="#SELECT ?s ?p ?o WHERE { ?s ?p ?o }">Default graph</a></em></li>'];
            $.each(data.results.bindings, function(i, row) {
                lis.push('<li><a href="#SELECT ?s ?p ?o WHERE { GRAPH &lt;' + row['g'].value + '&gt; { ?s ?p ?o } }">' + row['g'].value + '</a></li>');
            });
            $('#browsebygraphs .result_container').empty();
            $('#browsebygraphs .result_container').append('<ul>' + lis.join('') + '</ul>');
            // More button
            $('#browsebygraphs .result_container').append('<a href="#" class="morebtn">More...</a>');
            $('#browsebygraphs .result_container .morebtn').button();
            $('#browsebygraphs .result_container .morebtn').click(function () {
                window.location.hash = "SELECT DISTINCT ?g WHERE { GRAPH ?g { ?s ?p ?o } }";
                return false;
            });
        }
    });

    // Query concepts
    $('#browsebyconcepts .result_container').html($('<span>').addClass('loading'));
    $.ajax({
        type : 'GET',
        dataType : 'json',
        url : sparql_endpoint,
        data: $.param({'query' : "SELECT DISTINCT ?c WHERE { ?s a ?c } LIMIT 6"}),
        //error: function(req, st, err) { console.log(err); },
        success: function(data, textStatus, xhr) {
            lis = [];
            $.each(data.results.bindings, function(i, row) {
                lis.push('<li>' + render_term(row['c']) + '</li>');
            });
            $('#browsebyconcepts .result_container').empty();
            $('#browsebyconcepts .result_container').append('<ul>' + lis.join('') + '</ul>');
            // More button
            $('#browsebyconcepts .result_container').append('<a href="#" class="morebtn">More...</a>');
            $('#browsebyconcepts .result_container .morebtn').button();
            $('#browsebyconcepts .result_container .morebtn').click(function () {
                window.location.hash = "SELECT DISTINCT ?c WHERE { ?s a ?c }";
                return false;
            });
        }
    });
}

var current_ajax_check = null;

function update_sparql_endpoint(endpoint) {
    var input = $('#endpointoption input'),
        ajaxloader = $('#endpoint-ajax-loader');
    
    // If endpoint is empty assume user wants to cancel
    if (!endpoint) {
        input.val(sparql_endpoint);
        // Trigger change so that the clear button can react
        input.change();
        return
    }

    // reset css
    input.css("background-color", "");

    // Return if no changes made
    if (endpoint == sparql_endpoint)
        return

    // Return if we are currently checking this endpoint
    if (current_ajax_check == endpoint)
        return

    ajaxloader.show();

    current_ajax_check = endpoint;
    $.ajax({
        url: endpoint,
        data: $.param({'query' : "SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 1"}),
        //data: $.param({'query' : "ASK {?s ?p ?o}"}), // Use SELECT should be supported by all back-ends
        success: function(data, textStatus, xhr) {
            current_ajax_check = null;

            if (data) {
                ajaxloader.hide();
                sparql_endpoint = endpoint;
                $.cookie('deniz_endpoint', sparql_endpoint, {expires: cookie_expiration});

                // Add endpoint to combobox
                var endpoints = input.autocomplete("option", "source");
                if ($.inArray(sparql_endpoint, endpoints) < 0) {
                    endpoints.splice(0,0,sparql_endpoint);
                    input.autocomplete("option", "source", endpoints);
                    
                    // Remember the endpoint
                    var user_endpoints_cookie = $.cookie('deniz_user_endpoints'),
                        user_endpoints = user_endpoints_cookie ? user_endpoints_cookie.split(/,/) : new Array();
                    user_endpoints.push(sparql_endpoint);
                    $.cookie('deniz_user_endpoints', user_endpoints.join(','), {expires: cookie_expiration});
                }

                $("body").trigger("reload");
            } else {
                ajaxloader.hide();
                input.css("background-color", "red");
            }
        },
        error: function(req, st, err) {
            current_ajax_check = null;

            ajaxloader.hide();
            input.css("background-color", "red");
        }
    });
}

$(function() {
    // Set sparql endpoint
    endpoint = $.cookie('deniz_endpoint');
    if (endpoint) {
        sparql_endpoint = endpoint;
    }

    /* Endpoint configuration */

    // Add user endpoints to combobox
    var user_endpoints_cookie = $.cookie('deniz_user_endpoints'),
        user_endpoints = user_endpoints_cookie ? user_endpoints_cookie.split(/,/) : new Array(),
        endpoints = $.merge([], user_endpoints);
    $.merge(endpoints, default_endpoints);
    $("input#endpoint").autocomplete({
        source: endpoints,
        minLength: 0,
        appendTo: '#sparql',
        position: { my: "right top", at: "right bottom", collision: "none" },
        select: function(event, ui) {
            var elem = $(this);
            update_sparql_endpoint(ui.item.value);
            
            elem.blur();
        }
    }).blur(function() {
            var elem = $(this);
            // Catch change from user input and following blur
            update_sparql_endpoint(elem.val())
    }).keydown(function(event) {
        // React to Return on input field and use user specified value
        if (event.keyCode == 13) {
            var elem = $(this);
            update_sparql_endpoint(elem.val());
            // Close autocomplete menu and give up focus
            elem.autocomplete("close");
            elem.blur();
        }
    }).data("autocomplete")._renderItem = function(ul, item) {
        // TODO expensive here through iteration, store globally
        var user_endpoints_cookie = $.cookie('deniz_user_endpoints'),
            user_endpoints = user_endpoints_cookie ? user_endpoints_cookie.split(/,/) : new Array();
        
        // Mark user specified items for CSS styling
        var elem_class = $.inArray(item.value, user_endpoints) >= 0 ? 'user' : 'default'
        return $("<li></li>")
            .data("item.autocomplete", item)
            .addClass(elem_class)
            .append("<a>" + item.label + "</a>")
            .appendTo(ul);
    };
    $('#endpoint-container a').click(function() {
        var elem = $(this),
            input = $('#endpointoption input');
        // Clear value and reset css
        input.val("");
        $('#endpointoption input').css("background-color", "");
        
        // close if already visible
        if ( input.autocomplete( "widget" ).is( ":visible" ) ) {
                input.autocomplete( "close" );
                return;
        }

        // pass empty string as value to search for, displaying all results
        input.autocomplete("search", "");
        input.focus();
        elem.hide();
        return false;
    });
    $('#endpointoption input').change(function() {
        var elem = $(this);
        $('#endpoint-container a').show();
    });
    // Set endpoint to widget
    $('#endpointoption input').val(sparql_endpoint);
    $('#sparqloptionsform').submit(function() {
        return false;
    });

    /* Load page */

    // Tell jQuery to always tell the server that we expect sparql results in JSON
    $.ajaxSetup({
        beforeSend: function(req) {
            req.setRequestHeader("Accept", "application/sparql-results+json");
        }
    });

    $(window).hashchange(load_page);

    load_page();

    $('#executebtn').button();
    $('#executebtn').click(function() {
        window.location.hash = editor.getValue().replace(/\n/g, ' ');
        return false;
    });

    // Set-up editor
    var query_field = $('#query');
    query_field.val(function() {
            if (window.location.hash && window.location.hash != '#')
                return window.location.hash.replace(/^#/, '');
            else
                return initial_query;
    }());
    var editor = new CodeMirror.fromTextArea(query_field[0], {
        mode: "application/x-sparql-query",
        //saveFunction: function() {
        //    window.location.hash = editor.getValue().replace(/\n/g, ' ');
        //},
        matchBrackets: true
    });
});
