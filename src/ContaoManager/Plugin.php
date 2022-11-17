<?php

declare(strict_types=1);

namespace Postyou\ContaoVenoboxBundle\ContaoManager;

use Contao\CoreBundle\ContaoCoreBundle;
use Contao\ManagerPlugin\Bundle\BundlePluginInterface;
use Contao\ManagerPlugin\Bundle\Config\BundleConfig;
use Contao\ManagerPlugin\Bundle\Parser\ParserInterface;
use Postyou\ContaoVenoboxBundle\PostyouContaoVenoboxBundle;

class Plugin implements BundlePluginInterface
{
    public function getBundles(ParserInterface $parser): array
    {
        return [
            BundleConfig::create(PostyouContaoVenoboxBundle::class)
                ->setLoadAfter([ContaoCoreBundle::class]),
        ];
    }
}
