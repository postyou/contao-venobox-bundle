<?php

declare(strict_types=1);

namespace Postyou\ContaoVenoboxBundle\VenoBox;

use Contao\ContentImage;

class ContentVenoLinkImage extends ContentImage
{
    protected $strTemplate = 'ce_veno_image';

    protected function compile(): void
    {
        parent::compile();
        
        if (2 === (int) $this->fullsize) {
            $venobox = new VenoElement($this->venoList);

            VenoElement::loadVenoScripts();

            $venobox->setTemplateVars4ImageTempl($this->Template);
        }
    }
}
