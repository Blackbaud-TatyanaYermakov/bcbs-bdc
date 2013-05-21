/**
 * Distinction center re-design - T.Y. 12/02/2012
 */
$(function() {
  if ($('table#center_info').length > 0)
		(new centersResultPage()).process();
	else if ($('.blue-centers .filter-speciality').length > 0)
		(new centersSearchPage()).process();
});

function centersResultPage() {
	var self = this;
	
	// --- Members ---
	this.qs = getQueryString(window);
	this.suffix = getCenterTypeSuffix();

	// --- Public methods ---
	this.process = function() {
		var qs = self.qs,
			specialTypes = ['cancer', 'transplant'];
		
		// Init page data
		populateCenters();
		populateStatesList();
		populateSpecialities();
		populateSubList('cancer');
		populateSubList('transplant');

		// Bind - Specialty actions
		$('#center_type_drpdwn').change(function() {
			var specialties = $(this).val();

			$('#cancer_id_sub').hide();
			$('#transplant_id_sub').hide();

			if (specialties != null) {
				for (var i = 0; i < specialTypes.length; i++) {
					var subtype = specialTypes[i];
					if ($.inArray(subtype, specialties) > -1) {
						$('#' + subtype + '_id_sub').show();
					}
				}
			}
				
		});

		// Bind - States actions
		$('a.filter-states-change').click(function(e) {
			e.preventDefault();
			$('#filter-states-block').toggle('fast');
		});
		$('a.filter-states-reset').click(function(e) {
			e.preventDefault();
			resetStatesList();
		});
		$('#center_states_all').click(function(){
			if ($(this).prop('checked')) {
				clearPopUpList('.blue-centers-states');
				opacityElements('.blue-centers-states', true);
			}
			else {
				opacityElements('.blue-centers-states', false);
				populateStatesList();
			}
		});
		$('.blue-centers-states .filter-input').click(function(){
			var allStates = $('#center_states_all');
			if (allStates.prop('checked')) {
				allStates.prop('checked', false);
				opacityElements('.blue-centers-states', false);
				populateStatesList();
				$(this).prop('checked', true);
			}
		});
	
		// Bind - Sub-pecialty actions
		for (var i = 0; i < specialTypes.length; i++) {
			var type = specialTypes[i];
			bindSubListActions(type);
		}
		
		// Submit form
		$('form#treatment-options').submit(function(e) {
			e.preventDefault();

			var specialties = $('#center_type_drpdwn').val();
			if (specialties != null) {
				for (var i = 0 ; i < specialties.length ; i++) {
					$('.filter-speciality[value="' + specialties[i] + '"]').prop('checked', true);
				}
			}

			findBDCenters();
		});

		// Hide result table header if there are no results
		if ($('table#center_info tbody tr').length == 0) {
			$('table#center_info').remove();
		}
	}
		
	// --- Private methods ---
	function populateCenters() {
		var qs = self.qs;
		if (qs.hasOwnProperty('bdc_type')) {
			if (qs['bdc_type']) {
				$('#center_level_drpdwn').val(qs['bdc_type']);
			}
		}
	}

	function populateSpecialities() {
		var qs = self.qs,
			suffix = self.suffix,
			key = 'center_type' + suffix;

		if (qs.hasOwnProperty(key)) {
			var types = qs[key];
			for (var i = 0 ; i < types.length ; i++) {
				$('#center_type_drpdwn option[value="' + types[i] + '"]').prop('selected', true);
			}
		}
		else {
			$('#center_type_drpdwn option:first').prop('selected', true);
		}
	}

	function populateSubList(type) {
		var list = '',
			qs = self.qs,
			suffix = self.suffix,
			key = 'filter_' + type;

		if (qs.hasOwnProperty(key)) {
			if (qs[key].length == 1) {
				var types = (qs[key][0]).split(',');

				for (var i = 0 ; i < types.length ; i++) {
					var name = (types[i]).substr(0, 45);

					if (name != '') {
						var checkBox = $('input[value="' + name + '"]');
						if (checkBox) {
							checkBox.prop('checked', true);
							list += ', ' + $('label[for="' + checkBox.attr('id') + '"]').text();
						}
					}	
				}
			}	
		}
		
		if (list != '') {
			list = list.substr(2);
		}
		else if($('#center_type_drpdwn option[value="' + type + '"]').prop('selected')) {
			list = 'All';
		}

		if (list != '') {
			$('#filter-' + type + '-sub-list').text(list);
			$('#' + type + '_id_sub').show();
		}
	}

	function populateStatesList() {
		var states = '',
			qs = self.qs;
			
		if (qs.hasOwnProperty('state')) {
			for (var i = 0; i < qs['state'].length; i++) {
				var state = (qs['state'][i]).substr(0, 2);
				if (state != '') {
					$('#state_' + state).prop('checked', true);
					states += ', ' + state;
				}
			}
		}
		if (states != '')
			$('#filter-states-list').text(states.substr(2));
		else
			$('#filter-states-list').text('All States');
	}

	function bindSubListActions(type) {
		$('a.filter-' + type + '-sub-change').click(function(e){
			e.preventDefault();
			$('#filter-' + type + '-sub-block').toggle('fast');
		});
		$('a.filter-' + type + '-sub-reset').click(function(e){
			e.preventDefault();
			resetSubList(type);
		});
	
		$('#' + type + '_sub_all').click(function(){
			if ($(this).prop('checked')) {
				clearPopUpList('.' + type + '-sub-entries');
				opacityElements('.' + type + '-sub-entries', true);
			}
			else {
				opacityElements('.' + type + '-sub-entries', false);
				populateSubList(type);
			}
		});
		$('.' + type + '-sub-entries .filter-input').click(function(){
			var allCheck = $('#' + type + '_sub_all');
			if (allCheck.prop('checked')) {
				allCheck.prop('checked', false);
				opacityElements('.' + type + '-sub-entries', false);
				populateSubList(type);
				$(this).prop('checked', true);
			}
		});
	}
	
	function resetSubList(type) {
		clearPopUpList('#' + type + '_sub');
		populateSubList(type);
	}
	
	function opacityElements(wrpr, setOpacity) {
		$(wrpr + ' .filter-input').each(function() {
			if (setOpacity) 
				$(this).addClass('opacity5');
			else
				$(this).removeClass('opacity5');
		});
	}
	
	function clearPopUpList(wrpr) {
		$(wrpr + ' .filter-input').each(function() {
			$(this).prop('checked', false);
		});
	}
	
	function resetStatesList() {
		clearPopUpList('.blue-centers-states');
		populateStatesList();
	}
	
	function decode(s) {
		try {
			return decodeURIComponent(s).replace(/\r\n|\r|\n/g, '\r\n');
		} 
		catch (e) {
			return '';
		}
	}
	
	function getQueryString(win) {
		var qs = win.location.search;
		var multimap = {};
		if (qs.length > 1) {
			qs = qs.substr(1);
			qs.replace(/([^=&]+)=([^&]*)/g, function(match, hfname, hfvalue) {
				var name = decode(hfname);
				var value = decode(hfvalue);
				if (name.length > 0) {
					if (!multimap.hasOwnProperty(name)) {
						multimap[name] = [];
					}
					multimap[name].push(value);
				}
			});
		}
		return multimap;
	}

	function getCenterTypeSuffix() {
		var suffix = '',
			qs = self.qs;

		if (qs.hasOwnProperty('bdc_type')) {
			switch (qs['bdc_type'][0]) {
				case '' :
					suffix = '_all';
					break;

				case 'bdc-plus' :
					suffix = '_pls';
					break;
			}
		}	
			
		return suffix;
	}
} 

function centersSearchPage() {
	var self = this;
	
	// --- Public methods ---
	this.process = function() {
		$('.blue-centers .filter-speciality').click(function() {
			var eid = this.id;

			$('#error_top_level').fadeOut();
			$('#error_speciality').fadeOut();
			$('#error_speciality_cancer').fadeOut();
			$('#error_speciality_transplant').fadeOut();
	
			if ($(this).prop('checked')) {
				switch (eid) {
					case 'all_id' :
						$('.blue-centers .filter-speciality').each(function (index, elm) {
							if (eid != elm.id) {
								if ($(elm).prop('checked')) {
									$(elm).removeAttr('checked'); // Uncheck speciality
									$('#' + elm.id + '_sub').fadeOut(); // Hide sub specialities menu
								}
							}	
						});
						break;

					default :
						$('.blue-centers #all_id').removeAttr('checked');
						break;
				}
			}

			switch (eid) {
				case 'cancer_id':
				case 'transplant_id':
					$(this).prop('checked') ? $('#' + eid + '_sub').fadeIn() : $('#' + eid + '_sub').fadeOut();
					break;
			}
		});
	
		$('.blue-centers input[name="cancer_type"]').click(function() {
			$('#error_top_level').fadeOut();
			$('#error_speciality_cancer').fadeOut();
		});
		
		$('.blue-centers input[name="transplant_type"]').click(function() {
			$('#error_top_level').fadeOut();
			$('#error_speciality_transplant').fadeOut();
		});

		$('.blue-centers .all-sub-speciality').click(function() {
			var spec = (this.id).replace('_all', ''),
				type = spec.replace('_sub', '');
				subList = $('ul#' + spec);
				
			if ($(this).prop('checked')) {
				$('#error_speciality_' + type).fadeOut();
				subList.fadeOut();
			}
			else 
				subList.fadeIn();
		});
	
		$('#center_states_all').add('.blue-centers input[name="state"]').click(function() {
			$('#error_top_level').fadeOut();
			$('#error_state').fadeOut();
		});
	
		$('.blue-centers #center_states_all').click(function() {
			var statesTbl = $('table.blue-centers-states');
			if ($(this).prop('checked'))
				statesTbl.fadeOut();
			else 
				statesTbl.fadeIn();
		});
		
		// Submit validation	
		$('form#treatment-options').submit(function(e) {
			e.preventDefault();

			var blnOk = true, 
				blnError = false,
				specialTypes = ['cancer', 'transplant'];
			
			// Speciality
			blnError = true;
			$('.blue-centers input[name="center_type"]').each(function (index, elm) {
				if ($(elm).prop('checked')) {
					blnError = false;
					return;
				}
			});
			if (blnError) {
				blnOk = false;
				$('#error_speciality').fadeIn();
			}
			else { // Check sub level
				for (var i = 0; i < specialTypes.length; i++) {
					var type = specialTypes[i];
					if ($('#' + type + '_id').prop('checked') && !$('#' + type + '_sub_all').prop('checked')) {
						blnOk = validateSpecialitySubMenu(type);
					}
				}
			}
			
			// States
			blnError = !$('#center_states_all').prop('checked');
			if (blnError) {
				$('.blue-centers input[name="state"]').each(function (index, elm) {
					if ($(elm).prop('checked')) {
						blnError = false;
						return;
					}
				});
			}
			if (blnError) {
				blnOk = false;
				$('#error_state').fadeIn();
			}

			// Top error box
			if (!blnOk) {
				$('#error_top_level').fadeIn();
			}
			else {
				findBDCenters();
			}
		});
	}
		
	// --- Private methods ---
	function validateSpecialitySubMenu(type) {
		var blnOk = true;
		
		blnOk = false;
		$('.blue-centers input[name="' + type + '_type"]').each(function (index, elm) {
			if ($(elm).prop('checked')) {
				blnOk = true;
				return;
			}
		});
		if (!blnOk)
			$('#error_speciality_' + type).fadeIn();
		
		return blnOk;
	}
}

function findBDCenters() {
	var suffix = "",
		params = [],
		specialTypes = [],
		bdc_type = $('#treatment-options select[name="bdc_type"]').val();

	// Center type
	switch (bdc_type) {
		case '' :
			suffix = '_all';
			params.push({ name: 'bdc_desg', value: 'bdc' });
			params.push({ name: 'bdc_desg', value: 'bdc-plus' });
			break;

		case 'bdc' :
			params.push({ name: 'bdc_desg', value: 'bdc' });
			break;

		case 'bdc-plus' :
			suffix = '_pls';
			params.push({ name: 'bdc_desg', value: 'bdc-plus' });
			break;
	}
	params.push({ name: 'bdc_type', value: bdc_type });

	// Specialties
	if (!$('#all_id').prop('checked')) {
		var filter = '';
		$('#treatment-options input[name="center_type"]').each(function (index, elm) {
			var box = $(elm);
			if (box.prop('checked')) {
				filter += box.val() + ',';
				params.push({ name: box.attr('name') + suffix, value: box.val() });

				switch (box.val()) {
					case 'cancer' :
					case 'transplant' :
						specialTypes.push(box.val());
						break;
				}
			}
		});
		params.push({ name: 'filter_specialties', value: filter });
	}

	// Sub specialities
	for (var i = 0; i < specialTypes.length; i++) {
		var type = specialTypes[i];
		
		if (!$('#' + type + '_sub_all').prop('checked')) {
			var filter = '';
			$('#treatment-options input[name="' + type + '_type"]').each(function (index, elm) {
				var box = $(elm);
				if (box.prop('checked')) {
					filter += box.val() + ',';
				}
			});
			params.push({ name: 'filter_' + type, value: filter });
		}
	}

	// States
	if (!$('#center_states_all').prop('checked')) {
		$('#treatment-options input[name="state"]').each(function (index, elm) {
			var box = $(elm);
			if (box.prop('checked')) {
				params.push({ name: box.attr('name'), value: box.val() });
			}
		});
	}

	window.location = 'index.html?' + $.param(params);
}
