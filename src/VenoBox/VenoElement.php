<?php

declare(strict_types=1);

namespace Postyou\ContaoVenoboxBundle\VenoBox;

use Contao\Controller;
use Contao\Environment;
use Contao\FilesModel;
use Contao\Input;
use Postyou\ContaoPageToAjaxBundle\Pages\PageAjax;

class VenoElement
{
    public static $autoloadParamName = 'venoboxOpen';
    private $type;
    private $href;
    private $loadWithScripts = false;
    private $description = '';
    private $text = '';
    private $overlayColor = '';
    private $boxID;

    private $overlayCssClass = '';
    private $gallery = 1;
    private $linkCssClass = '';

    private $galleryID = 0;
    private $configArr = 0;

    public function __construct($initArray = null, $galleryID = 1, $class = '')
    {
        $this->configArr = $GLOBALS['TL_CONFIG']['VenoBoxWizard']['fields'];

        $venoBoxeProperties = VenoGenerator::getConfigArr($initArray);
        $this->setProperties($venoBoxeProperties, $galleryID, $class);
        $this->replaceHrefInsertTagsAjax();
    }

    public function __toString()
    {
        return $this->buildHtml();
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->boxID;
    }

    public function buildHtml($justOpenTag = false)
    {
        if (!$this->check4Page2Ajax()) {
            return '<p>install <a href="https://github.com/postyou/contao-page-to-ajax-bundle/">'.
                   'page-to-ajax-bundle</a> for this to work<p>'.($justOpenTag ? '<a>' : '');
        }
        $str = '';
        $str .= '<a ';
        $str .= $this->buildAtt().' ';
        $str .= " href='".$this->buildHrefStr()."' ";
        $str .= "title='".$this->buildDescStr()."' ";

        $str .= '>';
        if (!$justOpenTag) {
            $str .= $this->text.'</a>';
        }

        return $str;
    }

    public function setTemplateVars4ImageTempl($templateObj): void
    {
        if (!$this->check4Page2Ajax()) {
            $templateObj->href = false;
            $templateObj->linkTitle = 'VenoBox-Error';
        } else {
            $templateObj->href = $this->buildHrefStr();
            $templateObj->linkTitle = $this->buildDescStr();
            $templateObj->attributes = $this->buildAtt();
            $templateObj->venobox = true;
            $templateObj->jsScript = self::getJs();
        }
    }

    public function getJs()
    {
        if (TL_MODE === 'BE') {
            return '';
        }

        $autoLoadID = Input::get(self::$autoloadParamName);

        $strBuffer = "<script type=\"text/javascript\">
        $(document).ready(function() {
            var venoOptions={}\n
            if(typeof venobox_pre_open_callback  != 'undefined' && $.isFunction(venobox_pre_open_callback))
                venoOptions[\"pre_open_callback\"]=venobox_pre_open_callback;\n
			if(typeof venobox_post_open_callback  != 'undefined' && $.isFunction(venobox_post_open_callback))
                venoOptions[\"post_open_callback\"]=venobox_post_open_callback;\n
			if(typeof venobox_pre_close_callback  != 'undefined' && $.isFunction(venobox_pre_close_callback))
                venoOptions[\"pre_close_callback\"]=venobox_pre_close_callback;\n
			if(typeof venobox_post_close_callback  != 'undefined' && $.isFunction(venobox_post_close_callback))
                venoOptions[\"post_close_callback\"]=venobox_post_close_callback;\n
                if(typeof venobox_resize_close_callback  != 'undefined' && $.isFunction(venobox_resize_close_callback))
                venoOptions[\"post_resize_callback\"]=venobox_resize_close_callback;\n";
        $strBuffer .= "$('.".$this->getVenoBoxClass()."').venobox(venoOptions)";
        if (isset($autoLoadID) && !empty($autoLoadID) && $this->boxID === $autoLoadID) {
            $strBuffer .= ".trigger('click');\n";
        } else {
            $strBuffer .= ";\n";
        }
        $strBuffer .= '});</script>';

        return $strBuffer;
    }

    public function getVenoBoxClass()
    {
        return 'venobox_'.$this->boxID;
    }

    public static function loadVenoScripts(): void
    {
        if (TL_MODE !== 'BE') {
            $GLOBALS['TL_CSS'][] = 'bundles/postyoucontaovenobox/venobox/venobox.css';
            $GLOBALS['TL_JAVASCRIPT']['venobox'] = 'bundles/postyoucontaovenobox/venobox/venobox.js';
            $GLOBALS['TL_CSS'][] = 'bundles/postyoucontaovenobox/css/frontend.css';
        }
    }

    public function addClass($classStr): void
    {
        if (empty($this->linkCssClass)) {
            $this->linkCssClass = $classStr;
        } else {
            $this->linkCssClass .= ' '.$classStr;
        }
    }

    public static function renderCeText($objElement, $strBuffer)
    {
        // todo build veno element repalce A Tag with buildHTLM form VenoElement
//        $elem = unserialize($objElement->venoList);

        if (isset($objElement->type) && 'text' === $objElement->type) {
            if (2 === $objElement->fullsize && isset($objElement->venoList) && !empty($objElement->venoList)) {
                if (str_contains($strBuffer, '<a href')) {
                    $vElem = new self($objElement->venoList);
                    $html = $vElem->buildHtml(true)."\n";
                    self::loadVenoScripts();
                    $strBuffer = substr_replace(
                        $strBuffer,
                        $vElem->getJs().'</div>',
                        strrpos($strBuffer, '</div>') - 1
                    );

                    $a_start = strpos($strBuffer, '<a href');
                    $a_end = strpos($strBuffer, '>', $a_start) + 1;
                    $strBuffer = substr_replace($strBuffer, $html, $a_start, $a_end - $a_start);
                    $strBuffer = str_replace('ce_text', 'ce_text hasVenoImage', $strBuffer);
                }
            }
        }

        return $strBuffer;
    }

    private function setProperties($initArray, $galleryID = 1, $class = ''): void
    {
        if (null === $initArray) {
            return;
        }

        $this->type = (int) $initArray[$this->configArr['type']];
        $this->href = $initArray[$this->configArr['href']];
        if (isset($initArray[$this->configArr['scripts']])) {
            $this->loadWithScripts = (bool) $initArray[$this->configArr['scripts']];
        }
        $this->description = $initArray[$this->configArr['desc']];
        $this->text = $initArray[$this->configArr['text']];
        $this->overlayColor = $initArray[$this->configArr['overlayColor']];
        $this->boxID = $initArray[$this->configArr['id']];

        $this->linkCssClass = $class;

        if ($this->gallery) {
            $this->galleryID = $galleryID;
        }

        $this->overlayCssClass = 'veno_'.$GLOBALS['TL_CONFIG']['VenoBox']['types'][$this->type];

        if (0 === $this->type) {
            // big Image Path
            $objFileBig = FilesModel::findByPk($this->href);
            if (null !== $objFileBig && is_file(TL_ROOT.'/'.$objFileBig->path)) {
                $this->href = $objFileBig->path;
            }
            // Thumbnail path
            $objFileSmall = FilesModel::findByPk($this->text);
            if (null !== $objFileSmall && is_file(TL_ROOT.'/'.$objFileSmall->path)) {
                $this->text = "<img src='".$objFileSmall->path."'/>";
            }
        }
    }

    private function replaceHrefInsertTagsAjax(): void
    {
        if (preg_match('/\\{\\{(([^\\{\\}])*)\\}\\}/', $this->href ?? '')) {
            if (str_contains($this->href, '{{')) {
                $url = substr($this->href, 0, strpos($this->href, '{{'));
                $tagTyp = substr($this->href, 2, strpos($this->href, '::') - 2);

                switch ($tagTyp.'_'.$this->type) {
                    case 'link_url_6':
                        $url = '&amp;pageId='.str_replace(['{{'.$tagTyp.'::', '}}'], '', $this->href);

                        break;

                    case 'article_url_6':
                        $url = '&amp;articleId='.str_replace(['{{'.$tagTyp.'::', '}}'], '', $this->href);

                        break;

                    case 'link_url_1':
                        $url = Environment::get('base').Controller::replaceInsertTags($this->href);

                        break;

                    case 'article_url_1':
                        $url = Environment::get('base').Controller::replaceInsertTags($this->href);

                        break;

                    default:
                        $url = '#';
                }
                if (6 === $this->type && $this->loadWithScripts) {
                    $url .= '&lws=1';
                }
                $this->href = $url;
            }
        }
    }

    private function buildDescStr()
    {
        $title = '';
        if (isset($this->description) && !empty($this->description)) {
            $title .= $this->description;
        }

        return $title;
    }

    private function buildAtt()
    {
        $outputType = $this->type;
        if (6 === $this->type) {
            $outputType = 3;
        }
        $att = '';
        if (0 !== $this->type) {
            $att .= "data-vbtype='".$GLOBALS['TL_CONFIG']['VenoBox']['types'][$outputType]."' ";
        }

        if ($this->gallery) {
            $att .= "data-gall='venoGallery_".$this->galleryID."' ";
        }
        if (!empty($this->overlayCssClass)) {
            $att .= "data-css='".$this->overlayCssClass."' ";
        }
        if (!empty($this->overlayColor)) {
            $att .= "data-overlay='".$this->overlayColor."' ";
        }
        $att .= "class='venobox_".$this->boxID.' '.$this->linkCssClass."' ";

        return $att;
    }

    private function buildHrefStr()
    {
        $href = '';
        $href .= $this->href;
        if (3 === $this->type || 6 === $this->type) {
            if (!str_contains($this->href, '?')) {
                $href .= '?';
            } else {
                $href .= '&amp;';
            }
            $href .= 'rt='.REQUEST_TOKEN;
        }

        return $href;
    }

    private function check4Page2Ajax()
    {
        if (6 === $this->type) {
            if (class_exists('Postyou\\ContaoPageToAjaxBundle\\Pages\\PageAjax')) {
                $this->href = PageAjax::getAjaxURL().'?'.$this->href;

                return true;
            }

            return false;
        }

        return true;
    }
}
