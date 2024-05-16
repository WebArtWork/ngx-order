import { NgModule } from '@angular/core';
import { CoreModule } from 'src/app/core/core.module';
import { OrdersComponent } from './orders.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [{
	path: '',
	component: OrdersComponent
}];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CoreModule
	],
	declarations: [
		OrdersComponent
	],
	providers: []

})

export class OrdersModule { }
