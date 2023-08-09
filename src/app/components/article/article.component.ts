import { Component, Input, OnInit } from '@angular/core';
import { ActionSheetButton, ActionSheetController, Platform } from '@ionic/angular';

import { Browser } from '@capacitor/browser';
import { Article } from 'src/app/interfaces';

import { Share } from '@capacitor/share';
import { StorageServices } from 'src/app/services/storage.service';


@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
})
export class ArticleComponent {

  @Input() article!: Article;
  @Input() index!: number;

  constructor(
    private platform: Platform,
    private actionSheetCtrl: ActionSheetController,
    private storageService: StorageServices
    ) { }

  openArticle = async () => {

    if(this.platform.is('ios') || this.platform.is('android')){
      await Browser.open({ url: this.article.url });
      return;
    }

    window.open(this.article.url)

  }

  async onOpenMenu(){

    const articleInFavorite = this.storageService.articleInFavorite(this.article);

    const normalBtns: ActionSheetButton[] = [
      {
        text: articleInFavorite ? 'Remover favorito' : 'Favorito',
        icon: articleInFavorite ? 'heart' : 'heart-outline',
        handler: () => this.onToggleFavorite()
      },
      {
        text: 'Cancelar',
        icon: 'close-outline',
        role: 'destructive'
      }
    ]

    const shareBtn: ActionSheetButton = {
      text: 'Compartir',
      icon: 'share-outline',
      handler: () => this.onShareArticle()
    };

    if (this.platform.is('capacitor')) {
      normalBtns.unshift(shareBtn)
    }


    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: normalBtns,
      mode: 'ios'
    });

    await actionSheet.present();
  }

  async onShareArticle() {

    const {title, source, url} = this.article;

    await Share.share({
      title: `${title}`,
      text: `${source.name}`,
      url: `${url}`,
      dialogTitle: 'Share',
    });
  }

  onToggleFavorite(){
    this.storageService.saveRemoveArticle(this.article);
  }

}
