<?php

declare(strict_types=1);

if (TL_MODE === 'BE') {
    $GLOBALS['TL_CSS'][] = 'bundles/postyoucontaovenobox/css/backend.css';

    $GLOBALS['TL_JAVASCRIPT'][] =

        'assets/colorpicker/js/mooRainbow.js';

    $GLOBALS['TL_CSS'][] =

        'assets/colorpicker/css/mooRainbow.css';
}

$GLOBALS['TL_DCA']['tl_content']['palettes']['VenoBox'] =
    '{type_legend},type,headline,headlineOptn;'.
    '{venobox_list_legend},venoList;'.
    '{template_legend:hide},customTpl;'.
    '{protected_legend:hide},protected;'.
    '{expert_legend:hide},guests,cssID,space;'.
    '{invisible_legend:hide},invisible,start,stop';

$GLOBALS['TL_DCA']['tl_content']['fields']['type']['save_callback'] = [function ($varValue, $dc) {
    if ('image' === $varValue && isset($dc->activeRecord->venoList) && !empty($dc->activeRecord->venoList)) {
        $venoList = unserialize($dc->activeRecord->venoList);
        $venoList = [$venoList[0]];
        $dc->activeRecord->venoList = serialize($venoList);
    }

    return $varValue;
}];

$GLOBALS['TL_DCA']['tl_content']['fields']['venoList'] = [
    'label' => &$GLOBALS['TL_LANG']['tl_content']['venoList'],
    'exclude' => true,
    'inputType' => 'venoBoxWizard',
    'eval' => ['tl_class' => 'clr', 'doNotCopy' => true],
    'sql' => 'blob NULL',
    'load_callback' => [function ($varValue, $dc) {
        $numberOfIdField = $GLOBALS['TL_CONFIG']['VenoBoxWizard']['fields']['id'];
        $vallArr = unserialize($varValue ?? '');
        $changed = false;
        $uniqArr = [];

        if ($vallArr && !empty($vallArr)) {
            foreach ($vallArr as &$value) {
                if ($value && !empty($value)) {
                    if (!isset($value[$numberOfIdField]) || empty($value[$numberOfIdField])) {
                        $veno_id = uniqid('');
                        $res = $dc->Database->prepare('SELECT count(*) as count FROM tl_content WHERE id!=? AND venoList REGEXP ?')
                            ->execute($dc->id, $veno_id)->fetchAllAssoc();

                        if (1 === count($res[0])) {
                            $res = $res[0];
                        }

                        if (isset($res['count']) && 0 === $res['count'] && !in_array($veno_id, $uniqArr, true)) {
                            $value[$numberOfIdField] = $veno_id;
                            $uniqArr[] = $veno_id;
                            $changed = true;
                        }
                    }
                }
            }

            if ($changed) {
                $dc->Database->prepare('Update tl_content SET venoList=? WHERE id=?')->execute(
                    serialize($vallArr),
                    $dc->id
                );
            }
        }

        return serialize($vallArr);
    }],
];

$GLOBALS['TL_DCA']['tl_content']['fields']['fullsize']['default'] = 0;
$GLOBALS['TL_DCA']['tl_content']['fields']['fullsize']['inputType'] = 'radio';
$GLOBALS['TL_DCA']['tl_content']['fields']['fullsize']['options'] = [0, 1, 2];
$GLOBALS['TL_DCA']['tl_content']['fields']['fullsize']['reference'] = &$GLOBALS['TL_LANG']['tl_content'];
$GLOBALS['TL_DCA']['tl_content']['fields']['fullsize']['eval'] = ['submitOnChange' => true, 'tl_class' => 'clr'];

$GLOBALS['TL_DCA']['tl_content']['palettes']['image'] =
    str_replace(',fullsize', '', $GLOBALS['TL_DCA']['tl_content']['palettes']['image']);
$GLOBALS['TL_DCA']['tl_content']['palettes']['image'] =
    str_replace('{template_legend', '{veno_legend},fullsize;{template_legend', $GLOBALS['TL_DCA']['tl_content']['palettes']['image']);

// add Selector
$GLOBALS['TL_DCA']['tl_content']['palettes']['__selector__'][] = 'fullsize';

$GLOBALS['TL_DCA']['tl_content']['subpalettes']['fullsize_1'] = 'imageUrl';
$GLOBALS['TL_DCA']['tl_content']['subpalettes']['fullsize_2'] = 'venoList';
