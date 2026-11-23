document.addEventListener('DOMContentLoaded', function () {
  const dialog = document.getElementById('serviceQuoteDialog');
  const form = dialog?.querySelector('[data-service-quote-form]');
  const dynamicFields = document.getElementById('quoteDynamicFields');
  const estimate = document.getElementById('quoteEstimate');
  const timeline = document.getElementById('quoteTimeline');
  const packageInput = document.getElementById('quotePackage');
  const rangeInput = document.getElementById('quoteRange');
  const subjectInput = document.getElementById('quoteSubject');
  const messageInput = document.getElementById('quoteMessage');
  const projectSummary = document.getElementById('quoteProjectSummary');
  let activePackage;

  if (!dialog || !form || !dynamicFields || !estimate || !timeline || !packageInput || !rangeInput || !subjectInput || !messageInput || !projectSummary) {
    console.error('Service quote form could not initialize because required page elements are missing.');
    return;
  }

  function addCompletionIndicator(container) {
    if (container.querySelector(':scope > .quote-completion-indicator')) return;
    const indicator = document.createElement('span');
    indicator.className = 'quote-completion-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    const icon = document.createElement('i');
    icon.className = 'bx bx-check';
    indicator.append(icon);
    container.append(indicator);
  }

  function addRequiredMark(container) {
    const requiredMark = document.createElement('span');
    requiredMark.className = 'quote-required-mark';
    requiredMark.setAttribute('aria-hidden', 'true');
    requiredMark.textContent = ' *';
    container.append(requiredMark);
  }

  function addFieldPrice(label) {
    const price = document.createElement('span');
    price.className = 'quote-field-price';
    price.dataset.fieldPrice = 'true';
    label.insertBefore(price, label.querySelector('.quote-completion-indicator'));
    return price;
  }

  function makeOptionPrice(amount, priceMode) {
    if (!amount && !priceMode) return null;
    const price = document.createElement('span');
    price.className = 'quote-option-price';
    if (amount) price.textContent = `+${formatCurrency(amount)}`;
    if (priceMode) price.dataset[priceMode] = 'true';
    return price;
  }

  function makeRadioField(key, labelText, options, initialValue) {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'quote-fieldset quote-radio-group';
    const legend = document.createElement('legend');
    legend.textContent = labelText;
    addRequiredMark(legend);
    addCompletionIndicator(legend);
    fieldset.append(legend);

    options.forEach(([value, text, extra]) => {
      const wrapper = document.createElement('label');
      wrapper.className = 'quote-radio-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = key;
      input.value = value;
      input.required = true;
      input.checked = value === initialValue;
      input.dataset.extra = String(extra);
      input.dataset.optionLabel = text;
      const optionText = document.createElement('span');
      optionText.className = 'quote-option-text';
      optionText.textContent = text;
      const priceMode = key === 'delivery_speed' && value === 'express'
        ? 'expressPrice'
        : key === 'data_source' && value === 'sql_api_direct'
          ? 'sourcePrice'
          : null;
      const price = makeOptionPrice(Number(extra), priceMode);
      wrapper.append(input, optionText);
      if (price) wrapper.append(price);
      fieldset.append(wrapper);
    });
    return fieldset;
  }

  const packages = {
    'pkg-1': {
      title: 'Data Cleaning & Report Automation',
      base: 250,
      delivery: '3–5 business days standard · 1–3 days express',
      questions: [
        { key: 'package_source_files', label: 'How many files should be cleaned or automated?', type: 'number', min: 1, initial: 1, included: 1, unit: 25, cap: 150 },
        { key: 'execution_frequency', label: 'How often should this task run?', type: 'radio', initial: 'one_time', options: [
          ['one_time', 'One-time cleanup with a reusable script', 0],
          ['recurring', 'Automatic runs on a schedule', 100]
        ] },
        { key: 'output_formats', label: 'Where would you like to use the results?', type: 'checkboxes', initial: ['clean_excel_csv'], options: [
          ['clean_excel_csv', 'Clean Excel or CSV files', 0],
          ['google_sheets', 'Automatic updates to Google Sheets', 50],
          ['bi_model', 'A data model for Power BI or Tableau dashboards', 75],
          ['json_parquet', 'JSON or Parquet files for technical tools', 50]
        ] },
        { key: 'documentation', label: 'What kind of handoff would help your team?', type: 'select', initial: 'basic', options: [
          ['basic', 'Short setup and usage notes', 0],
          ['full', 'Technical guide + 30-minute walkthrough', 75]
        ] }
      ]
    },
    'pkg-2': {
      title: 'Business Intelligence & Interactive Dashboards',
      base: 500,
      delivery: '5–10 business days standard · 3–5 days express',
      questions: [
        { key: 'dashboard_pages', label: 'How many dashboard pages (views) do you need?', type: 'select', initial: '1_2', options: [
          ['1_2', '1–2 pages', 0],
          ['3_5', '3–5 pages', 200],
          ['6_plus', '6 or more pages', 400]
        ] },
        { key: 'dashboard_refresh_automation', label: 'Dashboard refresh (manual by default)', type: 'checkboxes', initial: [], optional: true, defaultSummary: 'Manual refresh (included)', options: [
          ['scheduled', 'Set up automated refresh in Power BI Service / Gateway', 150]
        ] },
        { key: 'modeled_tables', label: 'How many data sources or tables should be connected?', type: 'number', min: 1, initial: 3, included: 3, unit: 50, cap: 200 },
        { key: 'dax_complexity', label: 'What kind of custom Power BI calculations (DAX formula language) do you need?', type: 'select', initial: 'standard', options: [
          ['standard', 'Common measures (totals, averages, year-over-year comparisons)', 0],
          ['advanced', 'Advanced measures (dynamic groups, currency conversion)', 150]
        ] },
        { key: 'row_level_security', label: 'Should different team members see different data?', type: 'select', initial: 'none', options: [
          ['none', 'No special access rules', 0],
          ['basic', 'Yes, access based on each person’s role', 100],
          ['multi_tenant', 'Yes, access separated by team or organization', 250]
        ] },
        { key: 'training_handoff', label: 'What kind of guidance would help your team?', type: 'select', initial: 'recorded', options: [
          ['recorded', 'Recorded 30-minute walkthrough', 0],
          ['live', 'Live 60-minute session + written guide', 100]
        ] }
      ]
    },
    'pkg-3': {
      title: 'Statistical Analysis & Customer/Product Segmentation',
      base: 850,
      delivery: '10–15 business days standard · 5–8 days express',
      questions: [
        { key: 'record_volume', label: 'About how many rows (records) are in your data?', type: 'select', initial: 'under_10k', options: [
          ['under_10k', 'Fewer than 10,000 rows', 0],
          ['10k_100k', '10,000–100,000 rows', 100],
          ['100k_1m', '100,000–1 million rows', 250],
          ['over_1m', 'More than 1 million rows', 500]
        ] },
        { key: 'analysis_variables', label: 'How many columns or factors (variables) should be analyzed?', type: 'number', min: 1, initial: 15, included: 15, unit: 20, cap: 300 },
        { key: 'analysis_deliverable', label: 'What would you like to receive?', type: 'select', initial: 'report', options: [
          ['report', 'Findings report (PDF + summary)', 0],
          ['reusable_script', 'Report + reusable Python script or notebook', 200],
          ['interactive_tool', 'Report + script + interactive data exploration tool', 400]
        ] },
        { key: 'segmentation_methods', label: 'How would you like to group customers or products?', type: 'checkboxes', initial: ['rfm'], options: [
          ['rfm', 'RFM: how recently, how often, and how much customers buy', 0],
          ['clustering', 'Group similar behavior (K-Means or hierarchical clustering)', 150],
          ['cohort', 'Compare customer groups over time (cohort analysis)', 100],
          ['custom_rules', 'Groups based on your business rules', 200]
        ] },
        { key: 'statistical_rigor', label: 'How detailed should the statistical analysis be?', type: 'select', initial: 'basic', options: [
          ['basic', 'Summarize patterns + basic statistical tests', 0],
          ['advanced', 'Advanced tests, regression checks, and sample-size planning', 200],
          ['causal', 'Estimate cause and effect or compare options with an A/B test', 350]
        ] },
        { key: 'inventory_optimization', label: 'Would you like help with stock levels or sales planning?', type: 'select', initial: 'none', options: [
          ['none', 'Not needed', 0],
          ['abc_xyz', 'Group items by importance and set reorder points', 200],
          ['full_model', 'Build a full model to plan inventory levels', 400]
        ] }
      ]
    },
    'pkg-4': {
      title: 'Predictive Analytics, Machine Learning & AI',
      base: 1400,
      delivery: '15–25 business days standard · 8–12 days express',
      questions: [
        { key: 'model_type', label: 'What should the predictive model help you do?', type: 'select', initial: 'forecasting', options: [
          ['forecasting', 'Demand / sales forecasting', 0],
          ['classification', 'Predict a category (customer churn, lead quality, or risk)', 200],
          ['regression', 'Estimate a number (customer value or pricing)', 200],
          ['nlp', 'Analyze written feedback or other text (NLP)', 300],
          ['llm_automation', 'Automate a task using a large language model (LLM)', 500]
        ] },
        { key: 'forecast_horizon', label: 'How far ahead should the forecast look?', type: 'select', initial: '1_4_weeks', visibleWhen: { key: 'model_type', value: 'forecasting' }, options: [
          ['1_4_weeks', '1–4 weeks', 0],
          ['1_3_months', '1–3 months', 150],
          ['6_12_months', '6–12 months', 300],
          ['multiple', 'Several time periods or what-if scenarios', 500]
        ] },
        { key: 'series_count', label: 'How many products, locations, or groups should be modeled?', type: 'number', min: 1, initial: 1, included: 1, unit: 100, cap: 1000 },
        { key: 'external_variables', label: 'How many extra factors should the model consider (promotions, weather, etc.)?', type: 'number', min: 0, initial: 0, included: 0, unit: 75, cap: 450 },
        { key: 'delivery_format', label: 'How would you like to use the model results?', type: 'select', initial: 'notebook', options: [
          ['notebook', 'Jupyter Notebook (interactive report) + PDF', 0],
          ['api', 'REST API (a connection other software can use)', 400],
          ['scheduled', 'Predictions generated automatically on a schedule', 300],
          ['mlops', 'Automated model workflow with performance monitoring (MLOps)', 1000]
        ] },
        { key: 'model_explainability', label: 'How much explanation or compliance detail do you need?', type: 'select', initial: 'basic', options: [
          ['basic', 'Show which data factors most affect the result', 0],
          ['shap', 'Detailed explanations for individual predictions (SHAP)', 200],
          ['audit', 'Audit trail + review for bias and fairness', 500]
        ] },
        { key: 'post_delivery_support', label: 'What support would you like after delivery?', type: 'select', initial: 'two_weeks', options: [
          ['two_weeks', 'Two weeks of email support', 0],
          ['one_month', 'One month + one model retraining', 300],
          ['three_months', 'Three months + retraining + monitoring dashboard', 800]
        ] }
      ]
    }
  };

  function makeRequiredLabel(text) {
    const label = document.createElement('label');
    label.textContent = text;
    addRequiredMark(label);
    addCompletionIndicator(label);
    return label;
  }

  function makeSelectField(key, labelText, options, initialValue) {
    const wrapper = document.createElement('div');
    wrapper.className = 'quote-field';
    const id = `quote-${key}`;
    const label = makeRequiredLabel(labelText);
    label.htmlFor = id;
    const select = document.createElement('select');
    select.id = id;
    select.name = key;
    select.required = true;
    options.forEach(([value, text, extra]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = extra ? `${text} (+${formatCurrency(extra)})` : text;
      option.dataset.extra = String(extra);
      option.dataset.optionLabel = text;
      option.selected = value === initialValue;
      select.append(option);
    });

    wrapper.append(label, select);
    return wrapper;
  }

  function makeNumberField(question) {
    const wrapper = document.createElement('div');
    wrapper.className = 'quote-field';
    const id = `quote-${question.key}`;
    const label = makeRequiredLabel(question.label);
    label.htmlFor = id;
    addFieldPrice(label);
    const input = document.createElement('input');
    input.id = id;
    input.name = question.key;
    input.type = 'number';
    input.min = String(question.min);
    input.max = '10000';
    input.step = '1';
    input.value = String(question.initial);
    input.required = true;
    input.inputMode = 'numeric';
    wrapper.append(label, input);
    return wrapper;
  }

  function makeCheckboxField(question) {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'quote-fieldset quote-choice-group';
    const legend = document.createElement('legend');
    legend.textContent = question.label;
    if (!question.optional) addRequiredMark(legend);
    addCompletionIndicator(legend);
    fieldset.append(legend);

    question.options.forEach(([value, text, extra], index) => {
      const wrapper = document.createElement('label');
      wrapper.className = 'quote-checkbox-option';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = `${question.key}[]`;
      input.value = value;
      input.dataset.extra = String(extra);
      input.dataset.optionLabel = text;
      input.checked = question.initial.includes(value);
      if (index === 0) input.required = !question.optional && !question.initial.length;
      input.addEventListener('change', () => {
        const hasSelection = fieldset.querySelector('input:checked') !== null;
        const firstCheckbox = fieldset.querySelector('input[type="checkbox"]');
        if (firstCheckbox) firstCheckbox.required = !question.optional && !hasSelection;
      });
      const optionText = document.createElement('span');
      optionText.className = 'quote-option-text';
      optionText.textContent = text;
      const price = makeOptionPrice(Number(extra));
      wrapper.append(input, optionText);
      if (price) wrapper.append(price);
      fieldset.append(wrapper);
    });
    return fieldset;
  }

  function addSourceFields(container) {
    const sourceField = makeRadioField('data_source', 'Where do you keep your data right now?', [
      ['clean_excel_csv', 'Ready-to-use Excel or CSV spreadsheet files', 0],
      ['messy_multiple', 'Several files that need to be combined or cleaned', 0],
      ['sql_api_direct', 'A SQL database or API (connection to another software tool)', 100]
    ], 'clean_excel_csv');
    container.append(sourceField);

    const sourceCount = makeNumberField({
      key: 'source_count',
      label: 'About how many files, tables, or data connections are involved?',
      min: 2,
      initial: 2,
      included: 1
    });
    sourceCount.dataset.sourceCount = 'true';
    sourceCount.hidden = true;
    sourceCount.querySelector('input').required = false;
    container.append(sourceCount);

  }

  function renderPackageFields(selectedPackage) {
    dynamicFields.replaceChildren();
    const crossPackage = document.createElement('fieldset');
    crossPackage.className = 'quote-fieldset';
    const crossLegend = document.createElement('legend');
    crossLegend.textContent = 'Data sources';
    addCompletionIndicator(crossLegend);
    crossPackage.append(crossLegend);
    addSourceFields(crossPackage);
    dynamicFields.append(crossPackage);

    const packageFieldset = document.createElement('fieldset');
    packageFieldset.className = 'quote-fieldset';
    const packageLegend = document.createElement('legend');
    packageLegend.textContent = 'Package requirements';
    addCompletionIndicator(packageLegend);
    packageFieldset.append(packageLegend);
    const packageGrid = document.createElement('div');
    packageGrid.className = 'quote-fields-grid';

    selectedPackage.questions.forEach(question => {
      const field = question.type === 'number'
        ? makeNumberField(question)
        : question.type === 'checkboxes'
          ? makeCheckboxField(question)
          : question.type === 'radio'
            ? makeRadioField(question.key, question.label, question.options, question.initial)
            : makeSelectField(question.key, question.label, question.options, question.initial);
      field.dataset.question = question.key;
      if (question.visibleWhen) {
        field.dataset.visibleWhen = question.visibleWhen.key;
        field.dataset.visibleValue = question.visibleWhen.value;
        field.hidden = true;
        field.querySelectorAll('input, select').forEach(control => { control.disabled = true; });
      }
      packageGrid.append(field);
    });
    packageFieldset.append(packageGrid);
    dynamicFields.append(packageFieldset);

    const deliveryFieldset = document.createElement('fieldset');
    deliveryFieldset.className = 'quote-fieldset';
    const deliveryLegend = document.createElement('legend');
    deliveryLegend.textContent = 'How would you prefer to review the results?';
    addCompletionIndicator(deliveryLegend);
    deliveryFieldset.append(deliveryLegend);
    deliveryFieldset.append(makeRadioField('delivery_method', 'Choose a meeting option', [
      ['teams_meeting', 'Online meeting using Microsoft Teams', 0],
      ['onsite_gam', 'In-person presentation at my company (Greater Metropolitan Area / GAM, Costa Rica only)', 0]
    ], 'teams_meeting'));

    const onsiteLocation = document.createElement('div');
    onsiteLocation.className = 'quote-field';
    onsiteLocation.dataset.deliveryLocation = 'true';
    onsiteLocation.hidden = true;
    const locationLabel = document.createElement('label');
    locationLabel.htmlFor = 'quoteOnsiteLocation';
    locationLabel.textContent = 'Company location in Costa Rica’s Greater Metropolitan Area (GAM)';
    addCompletionIndicator(locationLabel);
    const locationInput = document.createElement('input');
    locationInput.id = 'quoteOnsiteLocation';
    locationInput.name = 'onsite_location';
    locationInput.type = 'text';
    locationInput.autocomplete = 'address-level2';
    locationInput.placeholder = 'City or area (for example, San José or Heredia)';
    locationInput.required = true;
    locationInput.disabled = true;
    onsiteLocation.append(locationLabel, locationInput);
    deliveryFieldset.append(onsiteLocation);
    dynamicFields.append(deliveryFieldset);

    dynamicFields.append(makeRadioField('delivery_speed', 'When do you need the project delivered?', [
      ['standard', 'Standard timeline', 0],
      ['express', 'Priority delivery (about 50% faster) · +20%', 0]
    ], 'standard'));
    addCompletionIndicators(dialog);
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  }

  function getControl(key) {
    return form.elements.namedItem(key);
  }

  function getSelectedOption(key) {
    return dialog.querySelector(`[name="${key}"]:checked`)
      || getControl(key)?.selectedOptions?.[0];
  }

  function getSelectedLabel(key) {
    return getSelectedOption(key)?.dataset.optionLabel
      || getSelectedOption(key)?.textContent
      || 'Not selected';
  }

  function getQuestionExtra(question) {
    if (question.type === 'number') {
      const control = getControl(question.key);
      if (!control?.value || !control.checkValidity()) return 0;
      const count = Number(control.value);
      return Number(question.initialExtra || 0)
        + Math.min(Math.max(0, count - question.included) * question.unit, question.cap);
    }

    if (question.type === 'checkboxes') {
      return Array.from(form.querySelectorAll(`[name="${question.key}[]"]:checked`))
        .reduce((total, control) => total + Number(control.dataset.extra), 0);
    }

    const selectedOption = getSelectedOption(question.key);
    return Number(selectedOption?.dataset.extra || 0);
  }

  function getSourceExtra() {
    const source = getControl('data_source')?.value;
    const sourceCount = getControl('source_count');
    const count = Number(sourceCount?.value || 1);
    if (source === 'messy_multiple') return Math.min(Math.max(0, count - 1) * 25, 150);
    if (source === 'sql_api_direct') return Math.min(100 + Math.max(0, count - 1) * 50, 250);
    return 0;
  }

  function getSourceBaseExtra(source = getControl('data_source')?.value) {
    return source === 'sql_api_direct' ? 100 : 0;
  }

  function setFieldPrice(indicator, amount) {
    if (!indicator) return;
    indicator.textContent = amount > 0 ? `+${formatCurrency(amount)}` : 'Included';
    indicator.classList.toggle('has-surcharge', amount > 0);
  }

  function updatePriceIndicators(subtotal) {
    const sourceCountField = dynamicFields.querySelector('[data-source-count]');
    const sourceCountPrice = sourceCountField?.querySelector('[data-field-price]');
    setFieldPrice(sourceCountPrice, Math.max(0, getSourceExtra() - getSourceBaseExtra()));

    activePackage.questions.forEach(question => {
      if (question.type !== 'number') return;
      const field = dynamicFields.querySelector(`[data-question="${question.key}"]`);
      setFieldPrice(field?.querySelector('[data-field-price]'), getQuestionExtra(question));
    });

    const sourcePrice = dynamicFields.querySelector('[data-source-price]');
    if (sourcePrice) sourcePrice.textContent = `+${formatCurrency(getSourceBaseExtra('sql_api_direct'))}`;
    const expressPrice = dynamicFields.querySelector('[data-express-price]');
    if (expressPrice) expressPrice.textContent = `+${formatCurrency(Math.round(subtotal * 0.2))}`;
  }

  function controlIsComplete(control) {
    if (control.disabled || control.type === 'hidden') return false;
    if (control.type === 'radio' || control.type === 'checkbox') {
      return Array.from(form.elements).some(item => item.name === control.name && item.checked);
    }
    return control.value.trim?.() !== ''
      && control.value !== ''
      && control.checkValidity();
  }

  function fieldsetIsComplete(fieldset) {
    const controls = Array.from(fieldset.querySelectorAll('input, select, textarea'))
      .filter(control => !control.disabled && control.type !== 'hidden');
    if (fieldset.hasAttribute('data-completion-any')) {
      return controls.some(controlIsComplete);
    }
    if (fieldset.classList.contains('quote-radio-group') || fieldset.classList.contains('quote-choice-group')) {
      return controls.some(control => control.checked);
    }
    const requiredControls = controls.filter(control => control.required);
    return requiredControls.length > 0 && requiredControls.every(controlIsComplete);
  }

  function updateCompletionIndicators() {
    dialog.querySelectorAll('.quote-field').forEach(field => {
      const controls = Array.from(field.querySelectorAll('input, select, textarea'))
        .filter(control => !control.disabled && control.type !== 'hidden');
      const indicator = field.querySelector('.quote-completion-indicator');
      const complete = controls.length > 0 && controls.every(controlIsComplete);
      indicator?.classList.toggle('is-complete', complete);
    });

    dialog.querySelectorAll('fieldset.quote-fieldset').forEach(fieldset => {
      const indicator = fieldset.querySelector(':scope > legend > .quote-completion-indicator');
      indicator?.classList.toggle('is-complete', fieldsetIsComplete(fieldset));
    });
  }

  function addCompletionIndicators(root) {
    root.querySelectorAll('fieldset.quote-fieldset > legend, .quote-field > label')
      .forEach(addCompletionIndicator);
  }

  function appendSummaryRow(label, value, extra = 0) {
    if (!value) return;
    const item = document.createElement('li');
    const text = document.createElement('span');
    text.className = 'quote-summary-text';
    const labelText = document.createElement('span');
    labelText.className = 'quote-summary-label';
    labelText.textContent = label;
    const valueText = document.createElement('span');
    valueText.className = 'quote-summary-value';
    valueText.textContent = value;
    text.append(labelText, valueText);
    item.append(text);
    if (extra > 0) {
      const price = document.createElement('span');
      price.className = 'quote-summary-price';
      price.textContent = `+${formatCurrency(extra)}`;
      item.append(price);
    }
    projectSummary.append(item);
  }

  function updateProjectSummary(selectedPackage, expressExtra) {
    projectSummary.replaceChildren();
    appendSummaryRow('Package', selectedPackage.title);
    appendSummaryRow('Business goal', getSelectedLabel('project_goal'));
    appendSummaryRow('Data source', getSelectedLabel('data_source'), getSourceBaseExtra());

    const sourceCount = getControl('source_count');
    if (sourceCount && !sourceCount.disabled) {
      appendSummaryRow('Files or data connections', sourceCount.value, Math.max(0, getSourceExtra() - getSourceBaseExtra()));
    }

    appendSummaryRow('How results are presented', getSelectedLabel('delivery_method'));

    const location = getControl('onsite_location');
    if (location && !location.disabled && location.value) {
      appendSummaryRow('Company location', location.value);
    }

    selectedPackage.questions.forEach(question => {
      const field = dynamicFields.querySelector(`[data-question="${question.key}"]`);
      if (field?.hidden) return;
      if (question.type === 'checkboxes') {
        const selectedOptions = Array.from(form.querySelectorAll(`[name="${question.key}[]"]:checked`));
        if (!selectedOptions.length && question.defaultSummary) {
          appendSummaryRow(question.label, question.defaultSummary);
        }
        selectedOptions.forEach(control => {
          appendSummaryRow(question.label, control.dataset.optionLabel, Number(control.dataset.extra));
        });
        return;
      }

      const control = getControl(question.key);
      const answer = question.type === 'number' ? control?.value : getSelectedLabel(question.key);
      appendSummaryRow(question.label, answer, getQuestionExtra(question));
    });

    const budget = getControl('available_budget');
    if (budget?.value) appendSummaryRow('Available budget', formatCurrency(Number(budget.value)));
    const adjustment = getSelectedOption('price_adjustment');
    if (adjustment) appendSummaryRow('Pricing preference', adjustment.dataset.optionLabel);
    appendSummaryRow('Delivery speed', getSelectedLabel('delivery_speed'), expressExtra);
  }

  function updateConditionalFields() {
    const source = getControl('data_source')?.value;
    const sourceField = dynamicFields.querySelector('[data-source-count]');
    const sourceControl = sourceField?.querySelector('input');
    const needsSourceCount = source === 'messy_multiple' || source === 'sql_api_direct';
    if (sourceField && sourceControl) {
      sourceField.hidden = !needsSourceCount;
      sourceControl.required = needsSourceCount;
      sourceControl.disabled = !needsSourceCount;
      sourceControl.min = source === 'messy_multiple' ? '2' : '1';
      if (sourceField.dataset.activeSource !== source) {
        sourceControl.value = source === 'messy_multiple' ? '2' : '1';
        sourceField.dataset.activeSource = source;
      }
    }

    dynamicFields.querySelectorAll('[data-visible-when]').forEach(field => {
      const visible = getControl(field.dataset.visibleWhen)?.value === field.dataset.visibleValue;
      field.hidden = !visible;
      field.querySelectorAll('input, select').forEach(control => { control.disabled = !visible; });
    });

    const onsiteField = dynamicFields.querySelector('[data-delivery-location]');
    const onsiteControl = onsiteField?.querySelector('input');
    const isOnsite = getControl('delivery_method')?.value === 'onsite_gam';
    if (onsiteField && onsiteControl) {
      onsiteField.hidden = !isOnsite;
      onsiteControl.disabled = !isOnsite;
      onsiteControl.required = isOnsite;
    }
  }

  function getAnswerLines(selectedPackage) {
    const lines = [
      `Name: ${getControl('name')?.value || 'Not provided'}`,
      `Email: ${getControl('email')?.value || 'Not provided'}`,
      `Company: ${getControl('company')?.value || 'Not provided'}`,
      `Role: ${getControl('role')?.value || 'Not provided'}`,
      `Business challenge: ${getSelectedLabel('project_goal')}`,
      `Data source: ${getSelectedLabel('data_source')}`,
      `Source count: ${getControl('source_count')?.disabled ? 'Not applicable' : getControl('source_count')?.value || 'Not provided'}`,
      `Preferred delivery format: ${getSelectedLabel('delivery_method')}`
    ];

    const location = getControl('onsite_location');
    if (location && !location.disabled) lines.push(`Company location: ${location.value || 'Not provided'}`);
    const budget = getControl('available_budget');
    if (budget?.value) lines.push(`Available budget: ${formatCurrency(Number(budget.value))}`);
    const adjustment = getSelectedOption('price_adjustment');
    if (adjustment) lines.push(`Pricing preference: ${adjustment.dataset.optionLabel}`);

    selectedPackage.questions.forEach(question => {
      const field = dynamicFields.querySelector(`[data-question="${question.key}"]`);
      if (field?.hidden) return;
      let answer;
      if (question.type === 'number') {
        answer = getControl(question.key)?.value || 'Not provided';
      } else if (question.type === 'checkboxes') {
        answer = Array.from(form.querySelectorAll(`[name="${question.key}[]"]:checked`))
          .map(control => control.dataset.optionLabel)
          .join(', ') || question.defaultSummary || 'None selected';
      } else {
        answer = getSelectedLabel(question.key);
      }
      lines.push(`${question.label}: ${answer}`);
    });
    lines.push(`Delivery speed: ${getSelectedLabel('delivery_speed')}`);
    return lines;
  }

  function updateEstimate() {
    if (!activePackage) return;
    updateConditionalFields();

    let subtotal = activePackage.base + getSourceExtra();
    activePackage.questions.forEach(question => {
      const field = dynamicFields.querySelector(`[data-question="${question.key}"]`);
      if (!field?.hidden) subtotal += getQuestionExtra(question);
    });
    const urgencyMultiplier = getControl('delivery_speed')?.value === 'express' ? 1.2 : 1;
    const expressExtra = urgencyMultiplier > 1 ? subtotal * 0.2 : 0;
    updatePriceIndicators(subtotal);
    updateProjectSummary(activePackage, expressExtra);
    updateCompletionIndicators();
    const finalPrice = subtotal * urgencyMultiplier;
    const minimum = Math.round(finalPrice * 0.9 / 10) * 10;
    const maximum = Math.round(finalPrice * 1.1 / 10) * 10;
    const range = `${formatCurrency(minimum)}–${formatCurrency(maximum)}`;
    estimate.textContent = range;
    rangeInput.value = range;
    subjectInput.value = `Quote request: ${activePackage.title}`;
    const lines = [
      `Quote request for: ${activePackage.title}`,
      `Estimated investment: ${range} USD`,
      `Estimated delivery: ${activePackage.delivery}`,
      '',
      ...getAnswerLines(activePackage),
      '',
      `Submitted: ${new Date().toISOString()}`,
      'Note: This is an approximate estimate and may be adjusted after reviewing the project scope. Seasonal promotions or discounts may apply.'
    ];
    messageInput.value = lines.join('\n');
  }

  document.querySelectorAll('[data-quote-package]').forEach(button => {
    button.setAttribute('aria-haspopup', 'dialog');
    button.addEventListener('click', function () {
      activePackage = packages[button.dataset.quotePackage];
      if (!activePackage) return;
      form.reset();
      form.querySelector('.quote-form-status').textContent = '';
      packageInput.value = activePackage.title;
      timeline.textContent = activePackage.delivery;
      renderPackageFields(activePackage);
      updateEstimate();
      dialog.showModal();
      dialog.querySelector('#quoteName')?.focus();
    });
  });

  addCompletionIndicators(dialog);
  dialog.querySelectorAll('[data-quote-close]').forEach(button => {
    button.addEventListener('click', () => dialog.close());
  });

  dialog.addEventListener('input', updateEstimate);
  dialog.addEventListener('change', updateEstimate);
  form.addEventListener('reset', () => {
    window.setTimeout(updateEstimate, 0);
  });
});
