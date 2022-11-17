<?php

declare(strict_types=1);

namespace Postyou\ContaoVenoboxBundle\Elements;

use Contao\BackendTemplate;
use Contao\ContentElement;
use Postyou\ContaoVenoboxBundle\VenoBox\VenoElement;
use Postyou\ContaoVenoboxBundle\VenoBox\VenoGenerator;

class VenoBox extends ContentElement
{
    protected $strTemplate = 'ce_venobox';

    public function __construct($objElement, $strColumn = 'main')
    {
        parent::__construct($objElement, $strColumn);
    }

    public function generate()
    {
        if (TL_MODE === 'BE') {
            $objTemplate = new BackendTemplate('be_wildcard');
            $objTemplate->wildcard = '### '.utf8_strtoupper('VenoBox').' ###';
            $objTemplate->title = $this->headline;
            $objTemplate->id = $this->id;
            $objTemplate->link = $this->name;
            $objTemplate->href = 'contao/main.php?do=themes&amp;table=tl_module&amp;act=edit&amp;id='.$this->id;

            return $objTemplate->parse();
        }

        return parent::generate();
    }

    /**
     * Compile the content element.
     */
    protected function compile(): void
    {
        if ('VenoBox' === $this->type) {
            $venoboxGen = new VenoGenerator($this->venoList);
            VenoElement::loadVenoScripts();
            $venoboxGen->setTemplateVars($this->Template);
        }
    }
}
